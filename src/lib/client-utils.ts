// Client-side utilities only - contains DOM operations
// This file should only be imported dynamically in client components

export type DownloadCardResult = {
  verified: true;
  width: number;
  height: number;
  size: number;
  method: "download" | "ios-preview" | "share";
  dataUrl?: string;
};

type DownloadCardOptions = {
  pixelRatio?: number;
};

function isIOSDevice(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[char];
  });
}

async function waitForImage(img: HTMLImageElement): Promise<void> {
  if (img.complete && img.naturalWidth > 0) return;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("تعذّر تحميل قالب البطاقة"));
  });
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  const loaded = new Promise<HTMLImageElement>((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("تعذّر تجهيز صورة البطاقة"));
  });
  image.src = src;
  return loaded;
}

async function loadImageViaBlob(src: string): Promise<HTMLImageElement> {
  // Fetch as blob then load via object URL to avoid any CORS taint on iOS Safari.
  try {
    const response = await fetch(src, { mode: "cors", credentials: "omit" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      return await loadImage(objectUrl);
    } finally {
      setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
    }
  } catch {
    // Fallback: direct image load (same-origin assets)
    return loadImage(src);
  }
}

async function waitForCardFont(text: string, fontSize: number, fontFamily: string) {
  if (!("fonts" in document)) return;

  const fonts = document.fonts;
  await fonts.ready;
  await fonts.load(`500 ${fontSize}px ${fontFamily}`, text || "بطاقة");
}

function verifyCanvasHasFullImage(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const columns = 9;
  const rows = 9;
  let opaqueSamples = 0;

  for (let row = 1; row <= rows; row++) {
    for (let column = 1; column <= columns; column++) {
      const x = Math.floor((width * column) / (columns + 1));
      const y = Math.floor((height * row) / (rows + 1));
      const [, , , alpha] = context.getImageData(x, y, 1, 1).data;
      if (alpha > 240) opaqueSamples += 1;
    }
  }

  if (opaqueSamples < columns * rows * 0.85) {
    throw new Error("فشل التحقق من الصورة: القالب غير ظاهر بالكامل");
  }
}

async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 1));

  if (!blob) {
    const dataUrl = canvas.toDataURL("image/png", 1);
    const response = await fetch(dataUrl);
    return response.blob();
  }

  return blob;
}

async function verifyPngBlob(
  blob: Blob,
  expectedWidth: number,
  expectedHeight: number,
): Promise<void> {
  const minimumSize = Math.max(80_000, expectedWidth * expectedHeight * 0.02);
  if (blob.size < minimumSize) {
    throw new Error("فشل التحقق من الصورة: حجم الملف أصغر من المتوقع");
  }

  const header = new Uint8Array(await blob.slice(0, 24).arrayBuffer());
  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
  const hasPngSignature = pngSignature.every((byte, index) => header[index] === byte);
  if (!hasPngSignature) {
    throw new Error("فشل التحقق من الصورة: الملف ليس PNG صالحًا");
  }

  const view = new DataView(header.buffer);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  if (width !== expectedWidth || height !== expectedHeight) {
    throw new Error("فشل التحقق من الصورة: أبعاد الملف غير صحيحة");
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("تعذّر تجهيز معاينة الصورة"));
    reader.readAsDataURL(blob);
  });
}

export async function downloadCardAsPng(
  element: HTMLElement,
  filename: string,
  options: DownloadCardOptions = {},
): Promise<DownloadCardResult> {
  const templateImage = element.querySelector("img") as HTMLImageElement | null;
  const nameElement = element.querySelector("[data-card-name]") as HTMLElement | null;

  if (!templateImage) {
    throw new Error("لم يتم العثور على قالب البطاقة");
  }

  await waitForImage(templateImage);

  const sourceImage = await loadImageViaBlob(templateImage.currentSrc || templateImage.src);
  const rect = element.getBoundingClientRect();
  // Calculate dynamic scale to match original template resolution for maximum export quality
  const scale = sourceImage.naturalWidth > 0 ? sourceImage.naturalWidth / rect.width : 3;
  const width =
    sourceImage.naturalWidth > 0
      ? sourceImage.naturalWidth
      : Math.round(Math.max(rect.width, 1) * scale);
  const height =
    sourceImage.naturalHeight > 0
      ? sourceImage.naturalHeight
      : Math.round(Math.max(rect.height, 1) * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("تعذّر إنشاء ملف الصورة");
  }

  context.clearRect(0, 0, width, height);
  context.drawImage(sourceImage, 0, 0, width, height);

  const nameText = nameElement?.textContent?.trim() ?? "";
  if (nameElement && nameText) {
    const computed = window.getComputedStyle(nameElement);
    const fontSize = Number.parseFloat(computed.fontSize || "20") * scale;
    const fontFamily = computed.fontFamily || '"IBM Plex Sans Arabic", sans-serif';
    const nameRect = nameElement.getBoundingClientRect();
    const containerRect = nameElement.parentElement?.getBoundingClientRect() ?? rect;
    const x = (nameRect.left + nameRect.width / 2 - rect.left) * scale;
    const y = (nameRect.top + nameRect.height / 2 - rect.top) * scale;
    const maxWidth = Math.max(containerRect.width * scale, width * 0.7);

    await waitForCardFont(nameText, fontSize, fontFamily);

    context.save();
    context.direction = "rtl";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `${computed.fontWeight || 500} ${fontSize}px ${fontFamily}`;
    context.fillStyle = computed.color || "#FFFFFF";
    context.shadowColor = "rgba(0, 0, 0, 0.35)";
    context.shadowBlur = 6 * scale;
    context.shadowOffsetY = 1 * scale;
    context.fillText(nameText, x, y, maxWidth);
    context.restore();
  }

  verifyCanvasHasFullImage(context, width, height);

  const blob = await canvasToPngBlob(canvas);
  await verifyPngBlob(blob, width, height);

  if (isIOSDevice()) {
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: filename,
        });
        return { verified: true, width, height, size: blob.size, method: "share" };
      } catch (shareError) {
        if (shareError instanceof Error && shareError.name === "AbortError") {
          return { verified: true, width, height, size: blob.size, method: "share" };
        }
        console.error("Web Share API failed:", shareError);
      }
    }

    const dataUrl = await blobToDataUrl(blob);
    return { verified: true, width, height, size: blob.size, method: "ios-preview", dataUrl };
  }

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = objectUrl;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

  return { verified: true, width, height, size: blob.size, method: "download" };
}

export function focusInputById(id: string): void {
  document.getElementById(id)?.focus();
}
