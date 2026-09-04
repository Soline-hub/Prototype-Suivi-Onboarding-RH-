"use client";

import { useState } from "react";
import { CHECKPOINT_LABELS, RESSENTI_LABELS } from "@/lib/labels";
import type { CheckpointListItem } from "@/types";
import type { Ressenti } from "@prisma/client";

const RESSENTI_OPTIONS: Ressenti[] = ["POSITIF", "NEUTRE", "A_SURVEILLER"];

export function MarkDoneModal({
  checkpoint,
  onClose,
  onSaved,
}: {
  checkpoint: CheckpointListItem;
  onClose: () => void;
  onSaved: (updated: CheckpointListItem) => void;
}) {
  const [ressenti, setRessenti] = useState<Ressenti>("POSITIF");
  const [pointsAlerte, setPointsAlerte] = useState("");
  const [actionsASuivre, setActionsASuivre] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/checkpoints/${checkpoint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ressenti, pointsAlerte, actionsASuivre }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Une erreur est survenue");
      }
      const updated = (await res.json()) as CheckpointListItem;
      onSaved({ ...checkpoint, ...updated });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">
          Marquer "{CHECKPOINT_LABELS[checkpoint.type]}" comme fait
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {checkpoint.collaborateur.prenom} {checkpoint.collaborateur.nom}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Ressenti global</label>
            <select
              value={ressenti}
              onChange={(e) => setRessenti(e.target.value as Ressenti)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              {RESSENTI_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {RESSENTI_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Points d&apos;alerte</label>
            <textarea
              value={pointsAlerte}
              onChange={(e) => setPointsAlerte(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              placeholder="Optionnel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Actions à suivre</label>
            <textarea
              value={actionsASuivre}
              onChange={(e) => setActionsASuivre(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              placeholder="Optionnel"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
