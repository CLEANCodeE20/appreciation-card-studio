// Client-side utilities only - contains DOM operations
// This file should only be imported dynamically in client components

export async function downloadCardAsPng(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // Dynamic import of browser-only library
  const { toPng } = await import("html-to-image");
  
  const dataUrl = await toPng(element, {
    pixelRatio: 3,
    cacheBust: true,
    quality: 1,
  });
  
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export function focusInputById(id: string): void {
  document.getElementById(id)?.focus();
}
