import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toUTCMidnight } from "@/lib/dates";
import { cancelRemainingCheckpoints, CHECKPOINT_TYPES, deriveDisplayStatus } from "@/lib/checkpoints";

/** Fiche individuelle : infos collaborateur + ses 4 points de suivi (parcours complet). */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const collaborateur = await prisma.collaborateur.findUnique({
    where: { id },
    include: { checkpoints: true },
  });

  if (!collaborateur) {
    return NextResponse.json({ error: "Collaborateur introuvable" }, { status: 404 });
  }

  const checkpoints = CHECKPOINT_TYPES.map((type) => {
    const cp = collaborateur.checkpoints.find((c) => c.type === type);
    if (!cp) return null;
    return { ...cp, displayStatus: deriveDisplayStatus(cp) };
  }).filter((cp) => cp !== null);

  return NextResponse.json({ ...collaborateur, checkpoints });
}

/** Marque le collaborateur comme "parti" : ses points non réalisés sont annulés. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body || body.action !== "marquer_parti") {
    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  }

  const collaborateur = await prisma.collaborateur.findUnique({ where: { id } });
  if (!collaborateur) {
    return NextResponse.json({ error: "Collaborateur introuvable" }, { status: 404 });
  }

  const dateDepart = body.dateDepart ? toUTCMidnight(new Date(body.dateDepart)) : toUTCMidnight(new Date());

  await prisma.collaborateur.update({
    where: { id },
    data: { statut: "PARTI", dateDepart },
  });
  const checkpoints = await cancelRemainingCheckpoints(prisma, id);

  return NextResponse.json({
    checkpoints: checkpoints.map((cp) => ({ ...cp, displayStatus: deriveDisplayStatus(cp) })),
  });
}
