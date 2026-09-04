export type TypeContratInput = "CDI" | "CDD" | "ALTERNANCE" | "STAGE";
export type StatutCollaborateurInput = "ACTIF" | "PARTI";

export interface CollaborateurInput {
  nom: string;
  prenom: string;
  dateEmbauche: Date;
  typeContrat: TypeContratInput;
  poste?: string;
  equipe?: string;
  bu?: string;
  manager?: string;
  padReferent?: string;
  statut: StatutCollaborateurInput;
  dateDepart?: Date;
}

/**
 * Source de données collaborateurs. Le reste de l'application (génération
 * des points de suivi, écrans) ne dépend que de cette interface : brancher
 * un connecteur Boond plus tard consiste à écrire une nouvelle implémentation
 * (ex. `BoondCollaborateurSource`) sans toucher au reste du code.
 */
export interface CollaborateurSource {
  readonly label: string;
  fetchCollaborateurs(): Promise<CollaborateurInput[]>;
}
