-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TypeContrat" AS ENUM ('CDI', 'CDD', 'ALTERNANCE', 'STAGE');

-- CreateEnum
CREATE TYPE "StatutCollaborateur" AS ENUM ('ACTIF', 'PARTI');

-- CreateEnum
CREATE TYPE "TypeCheckpoint" AS ENUM ('S1', 'M2', 'M4', 'M6');

-- CreateEnum
CREATE TYPE "StatutCheckpoint" AS ENUM ('A_VENIR', 'FAIT', 'ANNULE');

-- CreateEnum
CREATE TYPE "Ressenti" AS ENUM ('POSITIF', 'NEUTRE', 'A_SURVEILLER');

-- CreateTable
CREATE TABLE "Collaborateur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateEmbauche" TIMESTAMP(3) NOT NULL,
    "typeContrat" "TypeContrat" NOT NULL,
    "poste" TEXT,
    "equipe" TEXT,
    "bu" TEXT,
    "manager" TEXT,
    "padReferent" TEXT,
    "statut" "StatutCollaborateur" NOT NULL DEFAULT 'ACTIF',
    "dateDepart" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collaborateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checkpoint" (
    "id" TEXT NOT NULL,
    "collaborateurId" TEXT NOT NULL,
    "type" "TypeCheckpoint" NOT NULL,
    "datePrevue" TIMESTAMP(3) NOT NULL,
    "statut" "StatutCheckpoint" NOT NULL DEFAULT 'A_VENIR',
    "dateRealisation" TIMESTAMP(3),
    "ressenti" "Ressenti",
    "pointsAlerte" TEXT,
    "actionsASuivre" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "Checkpoint" ADD CONSTRAINT "Checkpoint_collaborateurId_fkey" FOREIGN KEY ("collaborateurId") REFERENCES "Collaborateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

