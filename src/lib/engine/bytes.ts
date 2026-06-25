/**
 * Build a Blob from binary data produced by a converter.
 *
 * Works around a TS 5.6 lib quirk: a generic `Uint8Array<ArrayBufferLike>` isn't directly a
 * valid `BlobPart` (its buffer could be a `SharedArrayBuffer`), so we copy `Uint8Array` data
 * into a fresh ArrayBuffer-backed array. `ArrayBuffer` input is already a valid `BlobPart`.
 */
export function asBlob(data: Uint8Array | ArrayBuffer, type: string): Blob {
  if (data instanceof ArrayBuffer) return new Blob([data], { type });
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return new Blob([copy], { type });
}
