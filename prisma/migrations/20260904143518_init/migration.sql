-- CreateTable
CREATE TABLE "Collaborateur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateEmbauche" DATETIME NOT NULL,
    "typeContrat" TEXT NOT NULL,
    "poste" TEXT,
    "equipe" TEXT,
    "bu" TEXT,
    "manager" TEXT,
    "padReferent" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "dateDepart" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collaborateurId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "datePrevue" DATETIME NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'A_VENIR',
    "dateRealisation" DATETIME,
    "ressenti" TEXT,
    "pointsAlerte" TEXT,
    "actionsASuivre" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Checkpoint_collaborateurId_fkey" FOREIGN KEY ("collaborateurId") REFERENCES "Collaborateur" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Collaborateur_statut_idx" ON "Collaborateur"("statut");

-- CreateIndex
CREATE INDEX "Collaborateur_dateEmbauche_idx" ON "Collaborateur"("dateEmbauche");

-- CreateIndex
CREATE INDEX "Checkpoint_datePrevue_idx" ON "Checkpoint"("datePrevue");

-- CreateIndex
CREATE INDEX "Checkpoint_statut_idx" ON "Checkpoint"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "Checkpoint_collaborateurId_type_key" ON "Checkpoint"("collaborateurId", "type");
