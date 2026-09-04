import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildCollaborateursFromCsv, parseCsvText, type ColumnMapping } from "@/lib/datasource/csv";
import { importCollaborateurs } from "@/lib/checkpoints";

/** Importe les collaborateurs valides du CSV (mapping fourni) et génère leurs points de suivi. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.csvText !== "string" || typeof body.mapping !== "object" || body.mapping === null) {
    return NextResponse.json({ error: "Requête d'import invalide" }, { status: 400 });
  }

  const { rows } = parseCsvText(body.csvText);
  const { collaborateurs, errors } = buildCollaborateursFromCsv(rows, body.mapping as ColumnMapping);

  const created = collaborateurs.length > 0 ? await importCollaborateurs(prisma, collaborateurs) : [];

  return NextResponse.json({
    imported: created.length,
    totalRows: rows.length,
    errors: errors.map((e) => (e.rowIndex >= 0 ? { ligne: e.rowIndex + 2, message: e.message } : { message: e.message })),
  });
}
