/**
 * Champs cibles pour l'import collaborateurs (CSV, et plus tard un
 * connecteur Boond). Utilisé à la fois par le parsing CSV et par l'écran
 * de mapping de colonnes.
 */
export interface TargetField {
  key:
    | "nom"
    | "prenom"
    | "dateEmbauche"
    | "typeContrat"
    | "poste"
    | "equipe"
    | "bu"
    | "manager"
    | "padReferent"
    | "statut"
    | "dateDepart";
  label: string;
  required: boolean;
  /** Variantes de noms d'en-têtes reconnues pour l'auto-détection du mapping. */
  aliases: string[];
}

export const TARGET_FIELDS: TargetField[] = [
  { key: "nom", label: "Nom", required: true, aliases: ["nom", "lastname", "last name", "nom de famille"] },
  { key: "prenom", label: "Prénom", required: true, aliases: ["prenom", "prénom", "firstname", "first name"] },
  {
    key: "dateEmbauche",
    label: "Date d'embauche",
    required: true,
    aliases: ["date embauche", "date d'embauche", "date d'entrée", "date entree", "hire date", "start date"],
  },
  {
    key: "typeContrat",
    label: "Type de contrat",
    required: true,
    aliases: ["type contrat", "type de contrat", "contrat", "contract type"],
  },
  { key: "poste", label: "Poste", required: false, aliases: ["poste", "job title", "titre"] },
  { key: "equipe", label: "Équipe", required: false, aliases: ["equipe", "équipe", "team"] },
  { key: "bu", label: "BU", required: false, aliases: ["bu", "business unit"] },
  {
    key: "manager",
    label: "Manager / CPL",
    required: false,
    aliases: ["manager", "cpl", "manager / cpl", "responsable"],
  },
  { key: "padReferent", label: "PAD référent", required: false, aliases: ["pad", "pad referent", "pad référent"] },
  { key: "statut", label: "Statut", required: false, aliases: ["statut", "status"] },
  {
    key: "dateDepart",
    label: "Date de départ",
    required: false,
    aliases: ["date depart", "date de départ", "departure date", "end date"],
  },
];

/** Devine, pour chaque champ cible, la colonne CSV correspondante à partir des en-têtes. */
export function guessMapping(headers: string[]): Partial<Record<TargetField["key"], string>> {
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim()
      .toLowerCase();

  const normalizedHeaders = headers.map((h) => ({ raw: h, norm: normalize(h) }));
  const mapping: Partial<Record<TargetField["key"], string>> = {};

  for (const field of TARGET_FIELDS) {
    const match = normalizedHeaders.find((h) => field.aliases.some((alias) => normalize(alias) === h.norm));
    if (match) mapping[field.key] = match.raw;
  }

  return mapping;
}
