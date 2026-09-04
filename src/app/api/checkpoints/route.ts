import { NextRequest, NextResponse } from "next/server";
import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { toUTCMidnight } from "@/lib/dates";
import { deriveDisplayStatus } from "@/lib/checkpoints";
import type { TypeCheckpoint } from "@prisma/client";

const VALID_TYPES: TypeCheckpoint[] = ["S1", "M2", "M4", "M6"];

/**
 * Liste des points de suivi pour la vue "Prochaines échéances" :
 * horizon glissant de `horizonDays` jours, plus tous les points en retard
 * quelle que soit leur date (ils doivent toujours être visibles).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const search = (searchParams.get("search") ?? "").trim().toLowerCase();
  const horizonDays = Number(searchParams.get("horizonDays") ?? 90);

  if (type && !VALID_TYPES.includes(type as TypeCheckpoint)) {
    return NextResponse.json({ error: `Type de point invalide : ${type}` }, { status: 400 });
  }

  const checkpoints = await prisma.checkpoint.findMany({
    where: type ? { type: type as TypeCheckpoint } : undefined,
    include: { collaborateur: true },
    orderBy: { datePrevue: "asc" },
  });

  const today = toUTCMidnight(new Date());
  const horizonEnd = addDays(today, horizonDays);

  const visible = checkpoints.filter((cp) => {
    const displayStatus = deriveDisplayStatus(cp);
    if (displayStatus === "ANNULE") return false;
    if (displayStatus === "EN_RETARD") return true;
    const d = toUTCMidnight(cp.datePrevue);
    return d >= today && d <= horizonEnd;
  });

  const filtered = search
    ? visible.filter((cp) => `${cp.collaborateur.prenom} ${cp.collaborateur.nom}`.toLowerCase().includes(search))
    : visible;

  const payload = filtered.map((cp) => ({
    id: cp.id,
    type: cp.type,
    datePrevue: cp.datePrevue,
    statut: cp.statut,
    displayStatus: deriveDisplayStatus(cp),
    dateRealisation: cp.dateRealisation,
    ressenti: cp.ressenti,
    pointsAlerte: cp.pointsAlerte,
    actionsASuivre: cp.actionsASuivre,
    collaborateur: {
      id: cp.collaborateur.id,
      nom: cp.collaborateur.nom,
      prenom: cp.collaborateur.prenom,
      manager: cp.collaborateur.manager,
      padReferent: cp.collaborateur.padReferent,
      poste: cp.collaborateur.poste,
      equipe: cp.collaborateur.equipe,
      bu: cp.collaborateur.bu,
    },
  }));

  return NextResponse.json(payload);
}
