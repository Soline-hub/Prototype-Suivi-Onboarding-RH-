import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { importCollaborateurs } from "@/lib/checkpoints";
import type { TypeContratInput } from "@/lib/datasource/types";

const VALID_TYPES_CONTRAT: TypeContratInput[] = ["CDI", "CDD", "ALTERNANCE", "STAGE"];

/** Crée un nouveau collaborateur (saisie manuelle d'un nouvel arrivant) et génère ses 4 points de suivi. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const nom = typeof body.nom === "string" ? body.nom.trim() : "";
  const prenom = typeof body.prenom === "string" ? body.prenom.trim() : "";
  if (!nom || !prenom) {
    return NextResponse.json({ error: "Nom et prénom sont obligatoires" }, { status: 400 });
  }

  const dateEmbauche = typeof body.dateEmbauche === "string" ? new Date(body.dateEmbauche) : null;
  if (!dateEmbauche || Number.isNaN(dateEmbauche.getTime())) {
    return NextResponse.json({ error: "Date d'embauche invalide" }, { status: 400 });
  }

  if (!VALID_TYPES_CONTRAT.includes(body.typeContrat)) {
    return NextResponse.json({ error: "Type de contrat invalide" }, { status: 400 });
  }

  const optionalString = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : undefined);

  const [created] = await importCollaborateurs(prisma, [
    {
      nom,
      prenom,
      dateEmbauche,
      typeContrat: body.typeContrat,
      poste: optionalString(body.poste),
      equipe: optionalString(body.equipe),
      bu: optionalString(body.bu),
      manager: optionalString(body.manager),
      padReferent: optionalString(body.padReferent),
      statut: "ACTIF",
    },
  ]);

  return NextResponse.json(created, { status: 201 });
}
