import Papa from "papaparse";
import type { CollaborateurInput, CollaborateurSource, StatutCollaborateurInput, TypeContratInput } from "./types";
import { TARGET_FIELDS, type TargetField } from "./fields";

export interface CsvParseResult {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCsvText(csvText: string): CsvParseResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return { headers: result.meta.fields ?? [], rows: result.data };
}

export type ColumnMapping = Partial<Record<TargetField["key"], string>>;

export interface RowError {
  rowIndex: number;
  message: string;
}

const CONTRAT_ALIASES: Record<string, TypeContratInput> = {
  cdi: "CDI",
  cdd: "CDD",
  alternance: "ALTERNANCE",
  apprentissage: "ALTERNANCE",
  stage: "STAGE",
  stagiaire: "STAGE",
};

const STATUT_ALIASES: Record<string, StatutCollaborateurInput> = {
  actif: "ACTIF",
  active: "ACTIF",
  parti: "PARTI",
  partie: "PARTI",
  sorti: "PARTI",
  "ex-collaborateur": "PARTI",
};

function normalizeKey(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/** Parse une date au format JJ/MM/AAAA, AAAA-MM-JJ ou JJ-MM-AAAA. */
export function parseFlexibleDate(raw: string): Date | null {
  const value = raw.trim();
  if (!value) return null;

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  }

  const frMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (frMatch) {
    const [, d, m, y] = frMatch;
    return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  }

  return null;
}

function parseTypeContrat(raw: string): TypeContratInput | null {
  return CONTRAT_ALIASES[normalizeKey(raw)] ?? null;
}

function parseStatut(raw: string): StatutCollaborateurInput {
  if (!raw.trim()) return "ACTIF";
  return STATUT_ALIASES[normalizeKey(raw)] ?? "ACTIF";
}

/**
 * Transforme les lignes CSV brutes (déjà mappées vers les colonnes cibles)
 * en `CollaborateurInput`, en collectant les erreurs de validation ligne par
 * ligne plutôt que d'échouer sur la première erreur.
 */
export function buildCollaborateursFromCsv(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): { collaborateurs: CollaborateurInput[]; errors: RowError[] } {
  const collaborateurs: CollaborateurInput[] = [];
  const errors: RowError[] = [];

  const missingRequired = TARGET_FIELDS.filter((f) => f.required && !mapping[f.key]);
  if (missingRequired.length > 0) {
    return {
      collaborateurs: [],
      errors: [
        {
          rowIndex: -1,
          message: `Colonnes obligatoires non mappées : ${missingRequired.map((f) => f.label).join(", ")}`,
        },
      ],
    };
  }

  rows.forEach((row, index) => {
    const get = (key: TargetField["key"]) => {
      const col = mapping[key];
      return col ? (row[col] ?? "").trim() : "";
    };

    const nom = get("nom");
    const prenom = get("prenom");
    const dateEmbaucheRaw = get("dateEmbauche");
    const typeContratRaw = get("typeContrat");

    if (!nom || !prenom) {
      errors.push({ rowIndex: index, message: "Nom et prénom sont obligatoires" });
      return;
    }

    const dateEmbauche = parseFlexibleDate(dateEmbaucheRaw);
    if (!dateEmbauche) {
      errors.push({ rowIndex: index, message: `Date d'embauche invalide : "${dateEmbaucheRaw}"` });
      return;
    }

    const typeContrat = parseTypeContrat(typeContratRaw);
    if (!typeContrat) {
      errors.push({ rowIndex: index, message: `Type de contrat invalide : "${typeContratRaw}"` });
      return;
    }

    const statut = parseStatut(get("statut"));
    const dateDepartRaw = get("dateDepart");
    const dateDepart = dateDepartRaw ? (parseFlexibleDate(dateDepartRaw) ?? undefined) : undefined;

    collaborateurs.push({
      nom,
      prenom,
      dateEmbauche,
      typeContrat,
      poste: get("poste") || undefined,
      equipe: get("equipe") || undefined,
      bu: get("bu") || undefined,
      manager: get("manager") || undefined,
      padReferent: get("padReferent") || undefined,
      statut,
      dateDepart,
    });
  });

  return { collaborateurs, errors };
}

export function createCsvCollaborateurSource(csvText: string, mapping: ColumnMapping): CollaborateurSource {
  return {
    label: "Import CSV",
    async fetchCollaborateurs() {
      const { rows } = parseCsvText(csvText);
      const { collaborateurs, errors } = buildCollaborateursFromCsv(rows, mapping);
      if (errors.length > 0) {
        throw new Error(errors.map((e) => (e.rowIndex >= 0 ? `Ligne ${e.rowIndex + 2} : ${e.message}` : e.message)).join("\n"));
      }
      return collaborateurs;
    },
  };
}
