export type MaterialFormat = "image" | "video" | "pdf" | "document";

/** The physical file format, not its commercial category, determines its preview. */
export function materialFormat(source: string, mimeType = ""): MaterialFormat {
  const path = source.split(/[?#]/)[0].toLowerCase();
  if (mimeType === "application/pdf" || /\.pdf$/.test(path)) return "pdf";
  if (mimeType.startsWith("image/") || /\.(jpe?g|png|gif|webp|avif|svg|bmp)$/.test(path)) return "image";
  if (mimeType.startsWith("video/") || /\.(mp4|webm|mov|m4v|ogv)$/.test(path)) return "video";
  return "document";
}

export function materialUploadKind(name: string, mimeType: string, selectedKind: string): string {
  const format = materialFormat(name, mimeType);
  if (format === "image") return "foto";
  if (format === "video") return "video";
  return selectedKind === "foto" || selectedKind === "video" ? "documento" : selectedKind;
}