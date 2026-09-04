"use client";

import { CHECKPOINT_LABELS, CHECKPOINT_TYPES } from "@/lib/labels";
import type { TypeCheckpoint } from "@prisma/client";

export function Filters({
  search,
  onSearchChange,
  type,
  onTypeChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  type: TypeCheckpoint | "";
  onTypeChange: (value: TypeCheckpoint | "") => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Rechercher un collaborateur…"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none sm:w-64"
      />
      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value as TypeCheckpoint | "")}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none sm:w-56"
      >
        <option value="">Tous les types de point</option>
        {CHECKPOINT_TYPES.map((t) => (
          <option key={t} value={t}>
            {CHECKPOINT_LABELS[t]}
          </option>
        ))}
      </select>
    </div>
  );
}
