"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckpointTypeBadge, StatusBadge } from "@/components/Badge";
import { MarkDoneModal } from "@/components/MarkDoneModal";
import { CHECKPOINT_DESCRIPTIONS, CHECKPOINT_LABELS, RESSENTI_LABELS, TYPE_CONTRAT_LABELS } from "@/lib/labels";
import type { CheckpointListItem, CollaborateurDetail } from "@/types";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
const formatDate = (iso: string) => dateFormatter.format(new Date(iso));

export default function CollaborateurPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [collaborateur, setCollaborateur] = useState<CollaborateurDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState<CheckpointListItem | null>(null);
  const [marquantParti, setMarquantParti] = useState(false);
  const [dateDepart, setDateDepart] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/collaborateurs/${id}`);
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    setCollaborateur(await res.json());
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleMarquerParti(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/collaborateurs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "marquer_parti", dateDepart: dateDepart || undefined }),
    });
    setMarquantParti(false);
    load();
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">Collaborateur introuvable.</p>
        <Link href="/" className="text-sm text-slate-900 underline">
          Retour aux échéances
        </Link>
      </div>
    );
  }

  if (!collaborateur) {
    return <p className="text-sm text-slate-500">Chargement…</p>;
  }

  const asListItem = (cp: CollaborateurDetail["checkpoints"][number]): CheckpointListItem => ({
    ...cp,
    collaborateur: {
      id: collaborateur.id,
      nom: collaborateur.nom,
      prenom: collaborateur.prenom,
      manager: collaborateur.manager,
      padReferent: collaborateur.padReferent,
      poste: collaborateur.poste,
      equipe: collaborateur.equipe,
      bu: collaborateur.bu,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Retour aux échéances
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {collaborateur.prenom} {collaborateur.nom}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {collaborateur.poste ?? "Poste non renseigné"}
              {collaborateur.equipe ? ` · ${collaborateur.equipe}` : ""}
              {collaborateur.bu ? ` · ${collaborateur.bu}` : ""}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
              collaborateur.statut === "ACTIF" ? "border-green-300 bg-green-50 text-green-700" : "border-slate-300 bg-slate-100 text-slate-600"
            }`}
          >
            {collaborateur.statut === "ACTIF" ? "Actif" : "Parti"}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-slate-500">Date d&apos;embauche</dt>
            <dd className="font-medium text-slate-900">{formatDate(collaborateur.dateEmbauche)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Type de contrat</dt>
            <dd className="font-medium text-slate-900">{TYPE_CONTRAT_LABELS[collaborateur.typeContrat] ?? collaborateur.typeContrat}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Manager / CPL</dt>
            <dd className="font-medium text-slate-900">{collaborateur.manager ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">PAD référent</dt>
            <dd className="font-medium text-slate-900">{collaborateur.padReferent ?? "—"}</dd>
          </div>
          {collaborateur.dateDepart && (
            <div>
              <dt className="text-slate-500">Date de départ</dt>
              <dd className="font-medium text-slate-900">{formatDate(collaborateur.dateDepart)}</dd>
            </div>
          )}
        </dl>

        {collaborateur.statut === "ACTIF" && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            {!marquantParti ? (
              <button
                onClick={() => setMarquantParti(true)}
                className="text-sm font-medium text-red-700 hover:underline"
              >
                Marquer ce collaborateur comme parti
              </button>
            ) : (
              <form onSubmit={handleMarquerParti} className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600">Date de départ</label>
                  <input
                    type="date"
                    value={dateDepart}
                    onChange={(e) => setDateDepart(e.target.value)}
                    className="mt-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                  />
                </div>
                <button type="submit" className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800">
                  Confirmer le départ
                </button>
                <button
                  type="button"
                  onClick={() => setMarquantParti(false)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <p className="w-full text-xs text-slate-500">
                  Les points de suivi non encore réalisés seront automatiquement annulés.
                </p>
              </form>
            )}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Parcours d&apos;onboarding</h2>
        <div className="mt-4 space-y-4">
          {collaborateur.checkpoints.map((cp) => (
            <div key={cp.id} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckpointTypeBadge type={cp.type} />
                  <span className="text-sm text-slate-500">{CHECKPOINT_DESCRIPTIONS[cp.type]}</span>
                </div>
                <StatusBadge status={cp.displayStatus} />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                <p>
                  Date prévue : <span className="font-medium text-slate-900">{formatDate(cp.datePrevue)}</span>
                  {cp.dateRealisation && (
                    <>
                      {" "}
                      · Réalisé le <span className="font-medium text-slate-900">{formatDate(cp.dateRealisation)}</span>
                    </>
                  )}
                </p>
                {cp.displayStatus !== "FAIT" && cp.displayStatus !== "ANNULE" && (
                  <button
                    onClick={() => setEditing(asListItem(cp))}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Marquer fait
                  </button>
                )}
              </div>

              {cp.statut === "FAIT" && (
                <dl className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-slate-500">Ressenti global</dt>
                    <dd className="font-medium text-slate-900">{cp.ressenti ? RESSENTI_LABELS[cp.ressenti] : "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Points d&apos;alerte</dt>
                    <dd className="text-slate-800">{cp.pointsAlerte || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Actions à suivre</dt>
                    <dd className="text-slate-800">{cp.actionsASuivre || "—"}</dd>
                  </div>
                </dl>
              )}
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <MarkDoneModal
          checkpoint={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
