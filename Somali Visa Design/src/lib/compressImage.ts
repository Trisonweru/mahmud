// Shrinks phone photos before upload so documents stay small in storage
// (a typical 3–8 MB camera image becomes ~300–500 KB). Long edge is capped at
// 2000px, which keeps passport text and the MRZ readable for eTAS submission.
// PDFs, already-small files, and formats the browser can't decode (e.g. HEIC
// outside Safari) are returned unchanged.
const MAX_EDGE = 2000;
const QUALITY = 0.85;
const SKIP_BELOW_BYTES = 500 * 1024;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size <= SKIP_BELOW_BYTES) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: file.lastModified });
  } catch {
    return file;
  }
}
