import { addDays, addMonths, subDays, subMonths } from "date-fns";
import { toUTCMidnight } from "@/lib/dates";
import type { CollaborateurInput, CollaborateurSource } from "./types";

/**
 * Jeu de données de démonstration : une quinzaine de collaborateurs
 * fictifs avec des dates d'embauche variées (relatives à aujourd'hui),
 * de façon à obtenir, sans dépendre d'un jour d'exécution précis, des
 * points déjà "en retard", déjà "faits", "à venir", et un collaborateur
 * "parti" avec des points "annulés".
 */
function buildDemoCollaborateurs(): CollaborateurInput[] {
  const today = toUTCMidnight(new Date());

  return [
    // Arrivée d'aujourd'hui : les 4 points sont à venir.
    {
      nom: "Bernard",
      prenom: "Camille",
      dateEmbauche: today,
      typeContrat: "CDI",
      poste: "Consultante SI",
      equipe: "Data & IA",
      bu: "BU Conseil",
      manager: "Julien Faure",
      padReferent: "Nadia Cherif",
      statut: "ACTIF",
    },
    // Arrivée il y a 5 jours : S+1 arrive dans 2 jours.
    {
      nom: "Diallo",
      prenom: "Moussa",
      dateEmbauche: subDays(today, 5),
      typeContrat: "CDI",
      poste: "Développeur Full Stack",
      equipe: "Digital Factory",
      bu: "BU Digital",
      manager: "Sarah Lopez",
      padReferent: "Nadia Cherif",
      statut: "ACTIF",
    },
    // Arrivée il y a 10 jours : S+1 en retard (jamais coché).
    {
      nom: "Petit",
      prenom: "Lucas",
      dateEmbauche: subDays(today, 10),
      typeContrat: "ALTERNANCE",
      poste: "Alternant DevOps",
      equipe: "Infra & Cloud",
      bu: "BU Digital",
      manager: "Sarah Lopez",
      padReferent: "Yasmine Ali",
      statut: "ACTIF",
    },
    // Arrivée il y a 3 semaines : S+1 fait, le reste à venir.
    {
      nom: "Garcia",
      prenom: "Elena",
      dateEmbauche: subDays(today, 21),
      typeContrat: "CDI",
      poste: "Business Analyst",
      equipe: "Conseil Finance",
      bu: "BU Conseil",
      manager: "Julien Faure",
      padReferent: "Yasmine Ali",
      statut: "ACTIF",
    },
    // Arrivée il y a ~1 mois : S+1 fait, M+2 à venir bientôt.
    {
      nom: "Nguyen",
      prenom: "Thi",
      dateEmbauche: subDays(today, 32),
      typeContrat: "CDI",
      poste: "Chef de projet",
      equipe: "Digital Factory",
      bu: "BU Digital",
      manager: "Sarah Lopez",
      padReferent: "Nadia Cherif",
      statut: "ACTIF",
    },
    // Arrivée il y a ~2 mois : M+2 en retard.
    {
      nom: "Rousseau",
      prenom: "Antoine",
      dateEmbauche: subMonths(today, 2),
      typeContrat: "CDD",
      poste: "Ingénieur Data",
      equipe: "Data & IA",
      bu: "BU Conseil",
      manager: "Julien Faure",
      padReferent: "Nadia Cherif",
      statut: "ACTIF",
    },
    // Arrivée il y a ~2 mois et quelques jours : S+1 et M+2 faits.
    {
      nom: "Martin",
      prenom: "Julie",
      dateEmbauche: subDays(subMonths(today, 2), 5),
      typeContrat: "CDI",
      poste: "UX Designer",
      equipe: "Digital Factory",
      bu: "BU Digital",
      manager: "Sarah Lopez",
      padReferent: "Yasmine Ali",
      statut: "ACTIF",
    },
    // Arrivée il y a ~3 mois : parcours en cours, M+4 à venir.
    {
      nom: "Fontaine",
      prenom: "Hugo",
      dateEmbauche: subMonths(today, 3),
      typeContrat: "CDI",
      poste: "Consultant SI",
      equipe: "Conseil Finance",
      bu: "BU Conseil",
      manager: "Julien Faure",
      padReferent: "Nadia Cherif",
      statut: "ACTIF",
    },
    // Arrivée il y a ~4 mois : M+4 en retard.
    {
      nom: "Lefevre",
      prenom: "Sophie",
      dateEmbauche: subDays(subMonths(today, 4), 3),
      typeContrat: "CDI",
      poste: "Développeuse Backend",
      equipe: "Digital Factory",
      bu: "BU Digital",
      manager: "Sarah Lopez",
      padReferent: "Yasmine Ali",
      statut: "ACTIF",
    },
    // Arrivée il y a ~4 mois : parcours à jour jusqu'à M+4, M+6 à venir.
    {
      nom: "Roux",
      prenom: "Nicolas",
      dateEmbauche: subDays(subMonths(today, 4), 10),
      typeContrat: "CDI",
      poste: "Ingénieur Cloud",
      equipe: "Infra & Cloud",
      bu: "BU Digital",
      manager: "Sarah Lopez",
      padReferent: "Nadia Cherif",
      statut: "ACTIF",
    },
    // Arrivée il y a ~5 mois : M+4 fait, M+6 à venir bientôt.
    {
      nom: "Simon",
      prenom: "Manon",
      dateEmbauche: subMonths(today, 5),
      typeContrat: "CDI",
      poste: "Consultante RH",
      equipe: "Conseil RH",
      bu: "BU Conseil",
      manager: "Julien Faure",
      padReferent: "Yasmine Ali",
      statut: "ACTIF",
    },
    // Arrivée il y a ~6 mois : M+6 en retard, parcours presque terminé.
    {
      nom: "Girard",
      prenom: "Thomas",
      dateEmbauche: subDays(subMonths(today, 6), 4),
      typeContrat: "CDI",
      poste: "Architecte Logiciel",
      equipe: "Data & IA",
      bu: "BU Conseil",
      manager: "Julien Faure",
      padReferent: "Nadia Cherif",
      statut: "ACTIF",
    },
    // Arrivée il y a ~7 mois : parcours complet, tous les points faits.
    {
      nom: "Morel",
      prenom: "Chloé",
      dateEmbauche: subMonths(today, 7),
      typeContrat: "CDI",
      poste: "Product Owner",
      equipe: "Digital Factory",
      bu: "BU Digital",
      manager: "Sarah Lopez",
      padReferent: "Yasmine Ali",
      statut: "ACTIF",
    },
    // Stage court : arrivé il y a 15 jours.
    {
      nom: "Blanc",
      prenom: "Emma",
      dateEmbauche: subDays(today, 15),
      typeContrat: "STAGE",
      poste: "Stagiaire Marketing RH",
      equipe: "Conseil RH",
      bu: "BU Conseil",
      manager: "Julien Faure",
      padReferent: "Nadia Cherif",
      statut: "ACTIF",
    },
    // Collaborateur parti avant la fin de son parcours (2 mois après son
    // embauche il y a ~3 mois) : ses points restants doivent être annulés.
    {
      nom: "Dubois",
      prenom: "Alexandre",
      dateEmbauche: subMonths(today, 3),
      typeContrat: "CDD",
      poste: "Chargé de recrutement",
      equipe: "Conseil RH",
      bu: "BU Conseil",
      manager: "Julien Faure",
      padReferent: "Yasmine Ali",
      statut: "PARTI",
      dateDepart: addMonths(subMonths(today, 3), 2),
    },
  ];
}

export function demoCollaborateurSource(): CollaborateurSource {
  return {
    label: "Données de démonstration",
    async fetchCollaborateurs() {
      return buildDemoCollaborateurs();
    },
  };
}
