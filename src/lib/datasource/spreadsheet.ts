import ExcelJS from "exceljs";
import { parseCsvText, type CsvParseResult } from "./csv";

/** Convertit une valeur de cellule ExcelJS (texte riche, date, formule…) en chaîne simple. */
function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("result" in value) return cellToString(value.result as ExcelJS.CellValue);
    if ("text" in value) return String((value as { text: unknown }).text ?? "");
    if ("richText" in value) {
      return (value as { richText: { text: string }[] }).richText.map((rt) => rt.text).join("");
    }
    return "";
  }
  return String(value);
}

async function parseXlsx(buffer: Buffer): Promise<CsvParseResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return { headers: [], rows: [] };

  const headerRow = worksheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: false }, (cell) => {
    headers.push(cellToString(cell.value).trim());
  });

  const rows: Record<string, string>[] = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: Record<string, string> = {};
    let hasValue = false;
    headers.forEach((header, i) => {
      const value = cellToString(row.getCell(i + 1).value);
      if (value) hasValue = true;
      record[header] = value;
    });
    if (hasValue) rows.push(record);
  });

  return { headers, rows };
}

/**
 * Parse un fichier importé (CSV ou Excel .xlsx) vers la même forme
 * {headers, rows} que consomme buildCollaborateursFromCsv, quel que soit
 * le format d'origine.
 */
export async function parseSpreadsheetFile(fileName: string, buffer: Buffer): Promise<CsvParseResult> {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "csv" || extension === "txt") {
    return parseCsvText(buffer.toString("utf-8"));
  }
  if (extension === "xlsx") {
    return parseXlsx(buffer);
  }
  throw new Error(`Format de fichier non supporté : "${fileName}". Utilisez un fichier .xlsx ou .csv.`);
}
