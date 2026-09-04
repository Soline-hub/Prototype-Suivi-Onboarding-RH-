"use client";

import { useCallback, useEffect, useState } from "react";
import { StatsBanner } from "@/components/StatsBanner";
import { Filters } from "@/components/Filters";
import { CheckpointTable } from "@/components/CheckpointTable";
import { MarkDoneModal } from "@/components/MarkDoneModal";
import type { CheckpointListItem, StatsResponse } from "@/types";
import type { TypeCheckpoint } from "@prisma/client";

const HORIZON_DAYS = 90;

export default function Home() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TypeCheckpoint | "">("");
  const [checkpoints, setCheckpoints] = useState<CheckpointListItem[] | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [editing, setEditing] = useState<CheckpointListItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCheckpoints = useCallback(async () => {
    const params = new URLSearchParams({ horizonDays: String(HORIZON_DAYS) });
    if (type) params.set("type", type);
    if (search) params.set("search", search);
    const res = await fetch(`/api/checkpoints?${params.toString()}`);
    if (!res.ok) {
      setError("Impossible de charger les points de suivi.");
      return;
    }
    setCheckpoints(await res.json());
  }, [type, search]);

  const loadStats = useCallback(async () => {
    const res = await fetch("/api/stats");
    if (res.ok) setStats(await res.json());
  }, []);

  useEffect(() => {
    loadCheckpoints();
  }, [loadCheckpoints]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  function handleSaved() {
    setEditing(null);
    loadCheckpoints();
    loadStats();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Prochaines échéances</h1>
        <p className="mt-1 text-sm text-slate-500">
          Points de suivi sur les {HORIZON_DAYS} prochains jours, plus tous les points en retard.
        </p>
      </div>

      {stats && <StatsBanner stats={stats} />}

      <div className="space-y-4">
        <Filters search={search} onSearchChange={setSearch} type={type} onTypeChange={setType} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        {checkpoints === null ? (
          <p className="text-sm text-slate-500">Chargement…</p>
        ) : (
          <CheckpointTable items={checkpoints} onMarkDone={setEditing} />
        )}
      </div>

      {editing && <MarkDoneModal checkpoint={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />}
    </div>
  );
}
