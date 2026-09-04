import type { Checkpoint, PrismaClient, Ressenti, StatutCheckpoint } from "@prisma/client";
import { computeCheckpointDates, toUTCMidnight } from "./dates";
import type { CollaborateurInput } from "./datasource/types";
import { CHECKPOINT_TYPES, type DisplayStatus } from "./labels";

export { CHECKPOINT_TYPES };
export type CheckpointDisplayStatus = DisplayStatus;

export function deriveDisplayStatus(checkpoint: {
  statut: StatutCheckpoint;
  datePrevue: Date;
}): CheckpointDisplayStatus {
  if (checkpoint.statut === "FAIT" || checkpoint.statut === "ANNULE") {
    return checkpoint.statut;
  }
  const today = toUTCMidnight(new Date());
  return toUTCMidnight(checkpoint.datePrevue) < today ? "EN_RETARD" : "A_VENIR";
}

/** Construit les 4 lignes de checkpoint (non persistées) pour un nouveau collaborateur. */
export function buildCheckpointsForCollaborateur(dateEmbauche: Date, dejaParti: boolean) {
  const dates = computeCheckpointDates(dateEmbauche);
  return CHECKPOINT_TYPES.map((type) => ({
    type,
    datePrevue: dates[type],
    // Un collaborateur déjà parti au moment de l'import n'a pas pu réaliser
    // ses points restants : ils sont créés directement "annulés" (voir la
    // règle de cycle de vie sur le départ).
    statut: (dejaParti ? "ANNULE" : "A_VENIR") as StatutCheckpoint,
  }));
}

/** Importe une liste de collaborateurs (venant d'une CollaborateurSource) et génère leurs 4 points. */
export async function importCollaborateurs(prisma: PrismaClient, inputs: CollaborateurInput[]) {
  const created: { id: string; nom: string; prenom: string }[] = [];

  for (const input of inputs) {
    const dejaParti = input.statut === "PARTI";
    const collaborateur = await prisma.collaborateur.create({
      data: {
        nom: input.nom,
        prenom: input.prenom,
        dateEmbauche: toUTCMidnight(input.dateEmbauche),
        typeContrat: input.typeContrat,
        poste: input.poste,
        equipe: input.equipe,
        bu: input.bu,
        manager: input.manager,
        padReferent: input.padReferent,
        statut: input.statut,
        dateDepart: input.dateDepart ? toUTCMidnight(input.dateDepart) : undefined,
        checkpoints: {
          create: buildCheckpointsForCollaborateur(input.dateEmbauche, dejaParti),
        },
      },
    });
    created.push({ id: collaborateur.id, nom: collaborateur.nom, prenom: collaborateur.prenom });
  }

  return created;
}

export interface CheckpointNotes {
  ressenti: Ressenti;
  pointsAlerte?: string;
  actionsASuivre?: string;
}

/** Marque un point comme "fait" et enregistre ses notes structurées. */
export async function markCheckpointDone(
  prisma: PrismaClient,
  checkpointId: string,
  notes: CheckpointNotes,
  dateRealisation: Date = new Date(),
): Promise<Checkpoint> {
  return prisma.checkpoint.update({
    where: { id: checkpointId },
    data: {
      statut: "FAIT",
      dateRealisation: toUTCMidnight(dateRealisation),
      ressenti: notes.ressenti,
      pointsAlerte: notes.pointsAlerte,
      actionsASuivre: notes.actionsASuivre,
    },
  });
}

/** Annule les points non encore réalisés d'un collaborateur qui vient d'être marqué "parti". */
export async function cancelRemainingCheckpoints(prisma: PrismaClient, collaborateurId: string): Promise<Checkpoint[]> {
  await prisma.checkpoint.updateMany({
    where: { collaborateurId, statut: "A_VENIR" },
    data: { statut: "ANNULE" },
  });
  return prisma.checkpoint.findMany({ where: { collaborateurId } });
}
