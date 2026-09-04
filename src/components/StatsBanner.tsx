import { CHECKPOINT_LABELS } from "@/lib/labels";
import type { StatsResponse } from "@/types";

export function StatsBanner({ stats }: { stats: StatsResponse }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">Points en retard</p>
        <p className="mt-1 text-3xl font-semibold text-red-800">{stats.late}</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-600">Échéances sous 7 jours</p>
        <p className="mt-1 text-3xl font-semibold text-slate-900">{stats.upcomingWithin7Days}</p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-2 lg:col-span-1">
        <p className="text-sm font-medium text-slate-600">Répartition des points à venir</p>
        <ul className="mt-2 space-y-1">
          {stats.byType.map(({ type, count }) => (
            <li key={type} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{CHECKPOINT_LABELS[type]}</span>
              <span className="font-semibold text-slate-900">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
