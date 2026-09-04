import { addDays, addMonths } from "date-fns";

/**
 * Jours fériés français + calcul de jours ouvrés, utilisés pour ajuster
 * les échéances de suivi (S+1, M+2, M+4, M+6) au prochain jour ouvré.
 *
 * Toutes les dates sont manipulées en UTC "à minuit" pour ignorer les
 * heures/fuseaux et ne raisonner qu'en jours calendaires.
 */

export function toUTCMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Dimanche de Pâques (algorithme de Meeus/Jones/Butcher, calendrier grégorien). */
export function pasquesDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = mars, 4 = avril
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function dateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
}

const holidaysCache = new Map<number, Set<string>>();

/** Jours fériés légaux français pour une année donnée (fixes + mobiles). */
export function getFrenchHolidays(year: number): Set<string> {
  const cached = holidaysCache.get(year);
  if (cached) return cached;

  const paques = pasquesDate(year);
  const dates = [
    new Date(Date.UTC(year, 0, 1)), // Jour de l'an
    addDays(paques, 1), // Lundi de Pâques
    new Date(Date.UTC(year, 4, 1)), // Fête du Travail
    new Date(Date.UTC(year, 4, 8)), // Victoire 1945
    addDays(paques, 39), // Ascension
    addDays(paques, 50), // Lundi de Pentecôte
    new Date(Date.UTC(year, 6, 14)), // Fête nationale
    new Date(Date.UTC(year, 7, 15)), // Assomption
    new Date(Date.UTC(year, 10, 1)), // Toussaint
    new Date(Date.UTC(year, 10, 11)), // Armistice
    new Date(Date.UTC(year, 11, 25)), // Noël
  ];

  const set = new Set(dates.map(dateKey));
  holidaysCache.set(year, set);
  return set;
}

export function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function isFrenchHoliday(date: Date): boolean {
  return getFrenchHolidays(date.getUTCFullYear()).has(dateKey(date));
}

export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isFrenchHoliday(date);
}

/** Renvoie la date telle quelle si c'est un jour ouvré, sinon le prochain jour ouvré. */
export function adjustToNextBusinessDay(date: Date): Date {
  let d = toUTCMidnight(date);
  while (!isBusinessDay(d)) {
    d = addDays(d, 1);
  }
  return d;
}

export type TypeCheckpointCode = "S1" | "M2" | "M4" | "M6";

export const CHECKPOINT_OFFSETS: { type: TypeCheckpointCode; addToDate: (d: Date) => Date }[] = [
  { type: "S1", addToDate: (d) => addDays(d, 7) },
  { type: "M2", addToDate: (d) => addMonths(d, 2) },
  { type: "M4", addToDate: (d) => addMonths(d, 4) },
  { type: "M6", addToDate: (d) => addMonths(d, 6) },
];

/**
 * Calcule les 4 dates prévues (S+1, M+2, M+4, M+6) à partir de la date
 * d'embauche, chacune ajustée au prochain jour ouvré si elle tombe un
 * week-end ou un jour férié.
 */
export function computeCheckpointDates(dateEmbauche: Date): Record<TypeCheckpointCode, Date> {
  const base = toUTCMidnight(dateEmbauche);
  const result = {} as Record<TypeCheckpointCode, Date>;
  for (const { type, addToDate } of CHECKPOINT_OFFSETS) {
    result[type] = adjustToNextBusinessDay(addToDate(base));
  }
  return result;
}
