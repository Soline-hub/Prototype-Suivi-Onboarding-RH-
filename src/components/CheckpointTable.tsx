"use client";

import Link from "next/link";
import { CheckpointTypeBadge, StatusBadge } from "@/components/Badge";
import type { CheckpointListItem } from "@/types";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

export function CheckpointTable({
  items,
  onMarkDone,
}: {
  items: CheckpointListItem[];
  onMarkDone: (checkpoint: CheckpointListItem) => void;
}) {
  if (items.length === 0) {
    return <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Aucun point de suivi à afficher.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Collaborateur</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Point</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Date prévue</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Statut</th>
            <th className="px-4 py-3 text-left font-medium text-slate-600">Manager / PAD</th>
            <th className="px-4 py-3 text-right font-medium text-slate-600">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link href={`/collaborateurs/${item.collaborateur.id}`} className="font-medium text-slate-900 hover:underline">
                  {item.collaborateur.prenom} {item.collaborateur.nom}
                </Link>
                {item.collaborateur.poste && <p className="text-xs text-slate-500">{item.collaborateur.poste}</p>}
              </td>
              <td className="px-4 py-3">
                <CheckpointTypeBadge type={item.type} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-700">{formatDate(item.datePrevue)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={item.displayStatus} />
              </td>
              <td className="px-4 py-3 text-slate-600">
                {item.collaborateur.manager && <p>{item.collaborateur.manager}</p>}
                {item.collaborateur.padReferent && <p className="text-xs text-slate-400">PAD : {item.collaborateur.padReferent}</p>}
              </td>
              <td className="px-4 py-3 text-right">
                {item.displayStatus !== "FAIT" ? (
                  <button
                    onClick={() => onMarkDone(item)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Marquer fait
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">{item.dateRealisation ? formatDate(item.dateRealisation) : ""}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
