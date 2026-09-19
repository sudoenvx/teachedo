export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.document !== "undefined";;
}

export function isMobileDevice(): boolean {
  if (!isBrowser()) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  if (!isBrowser()) return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isBrowser()) return false;
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // fallback for older/insecure contexts
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  } catch {
    return false;
  }
}

export function scrollToElement(elementId: string, options: ScrollIntoViewOptions = { behavior: "smooth", block: "start" }): void {
  document.getElementById(elementId)?.scrollIntoView(options);
}

export function getViewportSize(): { width: number; height: number } {
  if (!isBrowser()) return { width: 0, height: 0 };
  return { width: window.innerWidth, height: window.innerHeight };
}

export function downloadFile(data: Blob | string, filename: string): void {
  if (!isBrowser()) return;
  const blob = typeof data === "string" ? new Blob([data]) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getScrollbarWidth(): number {
  if (!isBrowser()) return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}