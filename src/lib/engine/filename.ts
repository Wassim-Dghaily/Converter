/** Branding mark added to every converted file's name. */
export const FILENAME_BRAND = "yallaconvert";

/**
 * Build the output filename: keep the original base name, append the brand mark, and use the
 * target extension. e.g. ("vacation.png", ".jpg") -> "vacation-yallaconvert.jpg".
 */
export function brandedFilename(originalName: string, targetExt: string): string {
  const base = originalName.replace(/\.[^.]+$/, "").trim() || "converted";
  return `${base}-${FILENAME_BRAND}${targetExt}`;
}
