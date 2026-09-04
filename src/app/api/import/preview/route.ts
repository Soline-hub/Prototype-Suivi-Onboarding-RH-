import { NextRequest, NextResponse } from "next/server";
import { parseSpreadsheetFile } from "@/lib/datasource/spreadsheet";
import { guessMapping, TARGET_FIELDS } from "@/lib/datasource/fields";

/** Parse l'en-tête + un aperçu du fichier importé (Excel .xlsx ou CSV) et propose un mapping de colonnes auto-détecté. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.fileName !== "string" || typeof body.fileBase64 !== "string" || !body.fileBase64) {
    return NextResponse.json({ error: "Fichier vide ou invalide" }, { status: 400 });
  }

  let headers: string[];
  let rows: Record<string, string>[];
  try {
    ({ headers, rows } = await parseSpreadsheetFile(body.fileName, Buffer.from(body.fileBase64, "base64")));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Impossible de lire ce fichier" }, { status: 400 });
  }

  if (headers.length === 0) {
    return NextResponse.json({ error: "Impossible de lire les en-têtes du fichier" }, { status: 400 });
  }

  return NextResponse.json({
    headers,
    fields: TARGET_FIELDS,
    guessedMapping: guessMapping(headers),
    previewRows: rows.slice(0, 5),
    rowCount: rows.length,
  });
}
