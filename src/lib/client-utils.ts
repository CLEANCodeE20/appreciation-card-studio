// Client-side utilities only - contains DOM operations
// This file should only be imported dynamically in client components

async function waitForImages(element: HTMLElement): Promise<void> {
  const imgs = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );
}

export async function downloadCardAsPng(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // Dynamic import of browser-only library
  const { toPng } = await import("html-to-image");

  // Ensure all images are fully loaded before capture (iOS Safari fix)
  await waitForImages(element);

  const options = {
    pixelRatio: 3,
    cacheBust: true,
    quality: 1,
    skipFonts: false,
  };

  // iOS Safari workaround: html-to-image often produces a blank/partial image
  // on the first call because images aren't yet inlined. Call multiple times.
  let dataUrl = "";
  for (let i = 0; i < 3; i++) {
    dataUrl = await toPng(element, options);
  }

  // iOS Safari blocks programmatic downloads via <a download>.
  // Open the image in a new tab so the user can long-press to save.
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS) {
    const win = window.open();
    if (win) {
      win.document.write(
        `<html><head><title>${filename}</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${dataUrl}" alt="${filename}" style="max-width:100%;height:auto;display:block;" /><p style="position:fixed;bottom:0;left:0;right:0;margin:0;padding:12px;background:rgba(0,0,0,0.7);color:#fff;text-align:center;font-family:sans-serif;font-size:14px;">اضغط مطولًا على الصورة ثم اختر "حفظ في الصور"</p></body></html>`
      );
      win.document.close();
    }
    return;
  }

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export function focusInputById(id: string): void {
  document.getElementById(id)?.focus();
}
