import type { Ressenti, TypeCheckpoint } from "@prisma/client";

/**
 * Libellés et styles d'affichage partagés entre l'UI (composants client) et
 * les routes API. Séparé de checkpoints.ts pour ne garder ici que des
 * constantes pures, sans dépendance à Prisma runtime.
 */

export const CHECKPOINT_TYPES: TypeCheckpoint[] = ["S1", "M2", "M4", "M6"];

export const CHECKPOINT_LABELS: Record<TypeCheckpoint, string> = {
  S1: "S+1",
  M2: "M+2",
  M4: "M+4 (tripartite)",
  M6: "M+6",
};

export const CHECKPOINT_DESCRIPTIONS: Record<TypeCheckpoint, string> = {
  S1: "1 semaine après l'embauche",
  M2: "2 mois après l'embauche",
  M4: "Point tripartite — RH + PAD + CPL (manager)",
  M6: "Point RH + collaborateur, sans manager/PAD",
};

export const CHECKPOINT_BADGE_CLASSES: Record<TypeCheckpoint, string> = {
  S1: "bg-sky-50 text-sky-700 border-sky-200",
  M2: "bg-violet-50 text-violet-700 border-violet-200",
  M4: "bg-amber-50 text-amber-800 border-amber-200",
  M6: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export type DisplayStatus = "A_VENIR" | "EN_RETARD" | "FAIT" | "ANNULE";

export const STATUS_LABELS: Record<DisplayStatus, string> = {
  A_VENIR: "À venir",
  EN_RETARD: "En retard",
  FAIT: "Fait",
  ANNULE: "Annulé",
};

export const STATUS_BADGE_CLASSES: Record<DisplayStatus, string> = {
  A_VENIR: "bg-slate-100 text-slate-700 border-slate-200",
  EN_RETARD: "bg-red-100 text-red-700 border-red-300",
  FAIT: "bg-green-100 text-green-800 border-green-300",
  ANNULE: "bg-slate-100 text-slate-400 border-slate-200",
};

export const RESSENTI_LABELS: Record<Ressenti, string> = {
  POSITIF: "Positif",
  NEUTRE: "Neutre",
  A_SURVEILLER: "À surveiller",
};

export const TYPE_CONTRAT_LABELS: Record<string, string> = {
  CDI: "CDI",
  CDD: "CDD",
  ALTERNANCE: "Alternance",
  STAGE: "Stage",
};
