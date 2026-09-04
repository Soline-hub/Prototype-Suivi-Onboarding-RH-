import type { Ressenti, StatutCheckpoint, TypeCheckpoint } from "@prisma/client";
import type { DisplayStatus } from "@/lib/labels";

/** Formes des réponses JSON des routes API, telles que reçues côté client (dates en ISO string). */

export interface CheckpointListItem {
  id: string;
  type: TypeCheckpoint;
  datePrevue: string;
  statut: StatutCheckpoint;
  displayStatus: DisplayStatus;
  dateRealisation: string | null;
  ressenti: Ressenti | null;
  pointsAlerte: string | null;
  actionsASuivre: string | null;
  collaborateur: {
    id: string;
    nom: string;
    prenom: string;
    manager: string | null;
    padReferent: string | null;
    poste: string | null;
    equipe: string | null;
    bu: string | null;
  };
}

export interface StatsResponse {
  late: number;
  upcomingWithin7Days: number;
  byType: { type: TypeCheckpoint; count: number }[];
}

export interface CollaborateurCheckpoint {
  id: string;
  type: TypeCheckpoint;
  datePrevue: string;
  statut: StatutCheckpoint;
  displayStatus: DisplayStatus;
  dateRealisation: string | null;
  ressenti: Ressenti | null;
  pointsAlerte: string | null;
  actionsASuivre: string | null;
}

export interface CollaborateurDetail {
  id: string;
  nom: string;
  prenom: string;
  dateEmbauche: string;
  typeContrat: string;
  poste: string | null;
  equipe: string | null;
  bu: string | null;
  manager: string | null;
  padReferent: string | null;
  statut: "ACTIF" | "PARTI";
  dateDepart: string | null;
  checkpoints: CollaborateurCheckpoint[];
}
