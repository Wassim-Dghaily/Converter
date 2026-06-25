import type { Converter, ConversionInput, ConversionResult } from "../types";
import { brandedFilename } from "../filename";
import { asBlob } from "../bytes";

/**
 * Spreadsheet / data converter (Phase 5a) — CSV ↔ XLSX ↔ JSON via SheetJS, in the browser.
 * JSON is treated as an array of row objects (the first sheet).
 */
export const spreadsheetConverter: Converter = {
  id: "spreadsheet-data",
  category: "spreadsheet",
  runtime: "client",
  status: "available",
  from: ["csv", "xlsx", "json"],
  to: ["csv", "xlsx", "json"],
  async convert({ file, from, to, onProgress }: ConversionInput): Promise<ConversionResult> {
    onProgress?.({ ratio: 0.2, stage: "Reading" });
    const XLSX = await import("xlsx");
    const buf = await file.arrayBuffer();

    let workbook;
    if (from.id === "json") {
      const parsed = JSON.parse(new TextDecoder().decode(buf));
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      const ws = XLSX.utils.json_to_sheet(rows);
      workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, ws, "Sheet1");
    } else {
      workbook = XLSX.read(buf, { type: "array" });
    }

    onProgress?.({ ratio: 0.6, stage: "Writing" });
    let blob: Blob;
    if (to.id === "json") {
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      blob = new Blob([JSON.stringify(json, null, 2)], { type: to.mime });
    } else {
      const bookType = to.id === "csv" ? "csv" : "xlsx";
      const out = XLSX.write(workbook, { type: "array", bookType }) as ArrayBuffer;
      blob = asBlob(out, to.mime);
    }

    onProgress?.({ ratio: 1, stage: "Done" });
    return { blob, filename: brandedFilename(file.name, to.ext) };
  },
};
