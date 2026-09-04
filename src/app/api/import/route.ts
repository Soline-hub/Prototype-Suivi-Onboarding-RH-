import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildCollaborateursFromCsv, type ColumnMapping } from "@/lib/datasource/csv";
import { parseSpreadsheetFile } from "@/lib/datasource/spreadsheet";
import { importCollaborateurs } from "@/lib/checkpoints";

/** Importe les collaborateurs valides du fichier (Excel .xlsx ou CSV, mapping fourni) et génère leurs points de suivi. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.fileName !== "string" ||
    typeof body.fileBase64 !== "string" ||
    !body.fileBase64 ||
    typeof body.mapping !== "object" ||
    body.mapping === null
  ) {
    return NextResponse.json({ error: "Requête d'import invalide" }, { status: 400 });
  }

  let rows: Record<string, string>[];
  try {
    ({ rows } = await parseSpreadsheetFile(body.fileName, Buffer.from(body.fileBase64, "base64")));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Impossible de lire ce fichier" }, { status: 400 });
  }

  const { collaborateurs, errors } = buildCollaborateursFromCsv(rows, body.mapping as ColumnMapping);

  const created = collaborateurs.length > 0 ? await importCollaborateurs(prisma, collaborateurs) : [];

  return NextResponse.json({
    imported: created.length,
    totalRows: rows.length,
    errors: errors.map((e) => (e.rowIndex >= 0 ? { ligne: e.rowIndex + 2, message: e.message } : { message: e.message })),
  });
}
