import { NextRequest, NextResponse } from "next/server";
import { parseCsvText } from "@/lib/datasource/csv";
import { guessMapping, TARGET_FIELDS } from "@/lib/datasource/fields";

/** Parse l'en-tête + un aperçu du CSV et propose un mapping de colonnes auto-détecté. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.csvText !== "string" || !body.csvText.trim()) {
    return NextResponse.json({ error: "Fichier CSV vide ou invalide" }, { status: 400 });
  }

  const { headers, rows } = parseCsvText(body.csvText);
  if (headers.length === 0) {
    return NextResponse.json({ error: "Impossible de lire les en-têtes du CSV" }, { status: 400 });
  }

  return NextResponse.json({
    headers,
    fields: TARGET_FIELDS,
    guessedMapping: guessMapping(headers),
    previewRows: rows.slice(0, 5),
    rowCount: rows.length,
  });
}
