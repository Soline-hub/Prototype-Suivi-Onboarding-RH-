"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TYPE_CONTRAT_LABELS } from "@/lib/labels";
import type { TypeContratInput } from "@/lib/datasource/types";

const TYPE_CONTRAT_OPTIONS: TypeContratInput[] = ["CDI", "CDD", "ALTERNANCE", "STAGE"];

export default function NouveauCollaborateurPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [dateEmbauche, setDateEmbauche] = useState("");
  const [typeContrat, setTypeContrat] = useState<TypeContratInput>("CDI");
  const [poste, setPoste] = useState("");
  const [equipe, setEquipe] = useState("");
  const [bu, setBu] = useState("");
  const [manager, setManager] = useState("");
  const [padReferent, setPadReferent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/collaborateurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, prenom, dateEmbauche, typeContrat, poste, equipe, bu, manager, padReferent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Impossible de créer ce collaborateur");
      router.push(`/collaborateurs/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Retour aux échéances
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Nouveau collaborateur</h1>
        <p className="mt-1 text-sm text-slate-500">
          Les 4 points de suivi (S+1, M+2, M+4, M+6) seront générés automatiquement à partir de la date d&apos;embauche.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-slate-700">
              Nom <span className="text-red-600">*</span>
            </label>
            <input
              id="nom"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-slate-700">
              Prénom <span className="text-red-600">*</span>
            </label>
            <input
              id="prenom"
              required
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="dateEmbauche" className="block text-sm font-medium text-slate-700">
              Date d&apos;embauche <span className="text-red-600">*</span>
            </label>
            <input
              id="dateEmbauche"
              required
              type="date"
              value={dateEmbauche}
              onChange={(e) => setDateEmbauche(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="typeContrat" className="block text-sm font-medium text-slate-700">
              Type de contrat <span className="text-red-600">*</span>
            </label>
            <select
              id="typeContrat"
              value={typeContrat}
              onChange={(e) => setTypeContrat(e.target.value as TypeContratInput)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              {TYPE_CONTRAT_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {TYPE_CONTRAT_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="poste" className="block text-sm font-medium text-slate-700">Poste</label>
            <input
              id="poste"
              value={poste}
              onChange={(e) => setPoste(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="equipe" className="block text-sm font-medium text-slate-700">Équipe</label>
            <input
              id="equipe"
              value={equipe}
              onChange={(e) => setEquipe(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="bu" className="block text-sm font-medium text-slate-700">BU</label>
            <input
              id="bu"
              value={bu}
              onChange={(e) => setBu(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="manager" className="block text-sm font-medium text-slate-700">Manager / CPL</label>
            <input
              id="manager"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="padReferent" className="block text-sm font-medium text-slate-700">PAD référent</label>
            <input
              id="padReferent"
              value={padReferent}
              onChange={(e) => setPadReferent(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? "Création…" : "Créer le collaborateur"}
          </button>
        </div>
      </form>
    </div>
  );
}
