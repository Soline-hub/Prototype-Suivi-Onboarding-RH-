import { PrismaClient, type TypeCheckpoint } from "@prisma/client";
import { importCollaborateurs, markCheckpointDone } from "../src/lib/checkpoints";
import { demoCollaborateurSource } from "../src/lib/datasource/demo";

const prisma = new PrismaClient();

/**
 * Points à marquer "fait" pour chaque collaborateur de démo, avec des
 * notes structurées variées, afin d'obtenir un jeu de données réaliste
 * mêlant points faits / en retard / à venir / annulés (voir demo.ts pour
 * le détail des scénarios visés par collaborateur).
 */
const DONE_CHECKPOINTS: Record<string, { type: TypeCheckpoint; ressenti: "POSITIF" | "NEUTRE" | "A_SURVEILLER" }[]> = {
  "Garcia Elena": [{ type: "S1", ressenti: "POSITIF" }],
  "Nguyen Thi": [{ type: "S1", ressenti: "POSITIF" }],
  "Martin Julie": [
    { type: "S1", ressenti: "POSITIF" },
    { type: "M2", ressenti: "POSITIF" },
  ],
  "Fontaine Hugo": [
    { type: "S1", ressenti: "NEUTRE" },
    { type: "M2", ressenti: "POSITIF" },
  ],
  "Lefevre Sophie": [
    { type: "S1", ressenti: "POSITIF" },
    { type: "M2", ressenti: "A_SURVEILLER" },
  ],
  "Roux Nicolas": [
    { type: "S1", ressenti: "POSITIF" },
    { type: "M2", ressenti: "POSITIF" },
    { type: "M4", ressenti: "POSITIF" },
  ],
  "Simon Manon": [
    { type: "S1", ressenti: "POSITIF" },
    { type: "M2", ressenti: "NEUTRE" },
    { type: "M4", ressenti: "POSITIF" },
  ],
  "Girard Thomas": [
    { type: "S1", ressenti: "NEUTRE" },
    { type: "M2", ressenti: "A_SURVEILLER" },
    { type: "M4", ressenti: "NEUTRE" },
  ],
  "Morel Chloé": [
    { type: "S1", ressenti: "POSITIF" },
    { type: "M2", ressenti: "POSITIF" },
    { type: "M4", ressenti: "POSITIF" },
    { type: "M6", ressenti: "POSITIF" },
  ],
  "Dubois Alexandre": [
    { type: "S1", ressenti: "POSITIF" },
    { type: "M2", ressenti: "NEUTRE" },
  ],
};

const ALERTES: Record<"POSITIF" | "NEUTRE" | "A_SURVEILLER", string> = {
  POSITIF: "",
  NEUTRE: "Rien de particulier à signaler.",
  A_SURVEILLER: "Charge de travail perçue comme élevée, à reclarifier avec le manager.",
};

const ACTIONS: Record<"POSITIF" | "NEUTRE" | "A_SURVEILLER", string> = {
  POSITIF: "Aucune action nécessaire pour le moment.",
  NEUTRE: "Refaire un point informel dans un mois.",
  A_SURVEILLER: "Point de suivi rapproché avec le manager sous 2 semaines.",
};

async function main() {
  const existing = await prisma.collaborateur.count();
  if (existing > 0) {
    console.log(`La base contient déjà ${existing} collaborateur(s), seed ignoré.`);
    return;
  }

  const inputs = await demoCollaborateurSource().fetchCollaborateurs();
  const created = await importCollaborateurs(prisma, inputs);

  for (const collaborateur of created) {
    const key = `${collaborateur.nom} ${collaborateur.prenom}`;
    const toMarkDone = DONE_CHECKPOINTS[key];
    if (!toMarkDone) continue;

    const checkpoints = await prisma.checkpoint.findMany({ where: { collaborateurId: collaborateur.id } });
    for (const { type, ressenti } of toMarkDone) {
      const checkpoint = checkpoints.find((c) => c.type === type);
      if (!checkpoint) continue;
      await markCheckpointDone(
        prisma,
        checkpoint.id,
        { ressenti, pointsAlerte: ALERTES[ressenti], actionsASuivre: ACTIONS[ressenti] },
        checkpoint.datePrevue,
      );
    }
  }

  console.log(`${created.length} collaborateurs de démonstration importés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
