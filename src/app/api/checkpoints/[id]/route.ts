import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deriveDisplayStatus, markCheckpointDone } from "@/lib/checkpoints";
import type { Ressenti } from "@prisma/client";

const VALID_RESSENTIS: Ressenti[] = ["POSITIF", "NEUTRE", "A_SURVEILLER"];

/** Marque un point de suivi comme "fait" et enregistre ses notes structurées. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body || !VALID_RESSENTIS.includes(body.ressenti)) {
    return NextResponse.json({ error: "Le ressenti global est obligatoire" }, { status: 400 });
  }

  const checkpoint = await prisma.checkpoint.findUnique({ where: { id } });
  if (!checkpoint) {
    return NextResponse.json({ error: "Point de suivi introuvable" }, { status: 404 });
  }
  if (checkpoint.statut === "ANNULE") {
    return NextResponse.json({ error: "Ce point a été annulé et ne peut plus être marqué fait" }, { status: 409 });
  }

  const updated = await markCheckpointDone(
    prisma,
    id,
    {
      ressenti: body.ressenti,
      pointsAlerte: typeof body.pointsAlerte === "string" ? body.pointsAlerte.trim() || undefined : undefined,
      actionsASuivre: typeof body.actionsASuivre === "string" ? body.actionsASuivre.trim() || undefined : undefined,
    },
    body.dateRealisation ? new Date(body.dateRealisation) : new Date(),
  );

  return NextResponse.json({ ...updated, displayStatus: deriveDisplayStatus(updated) });
}
