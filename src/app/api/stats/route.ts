import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { toUTCMidnight } from "@/lib/dates";
import { CHECKPOINT_TYPES, deriveDisplayStatus } from "@/lib/checkpoints";
import type { TypeCheckpoint } from "@prisma/client";

const HORIZON_DAYS = 90;

/** Bandeau de stats du dashboard : retards, échéances sous 7 jours, répartition par type. */
export async function GET() {
  const checkpoints = await prisma.checkpoint.findMany();

  const today = toUTCMidnight(new Date());
  const in7Days = addDays(today, 7);
  const horizonEnd = addDays(today, HORIZON_DAYS);

  let late = 0;
  let upcomingWithin7Days = 0;
  const byType: Record<TypeCheckpoint, number> = { S1: 0, M2: 0, M4: 0, M6: 0 };

  for (const cp of checkpoints) {
    const displayStatus = deriveDisplayStatus(cp);
    if (displayStatus === "EN_RETARD") {
      late += 1;
    } else if (displayStatus === "A_VENIR") {
      const d = toUTCMidnight(cp.datePrevue);
      // Répartition alignée sur l'horizon glissant affiché dans la vue "Prochaines échéances".
      if (d <= horizonEnd) byType[cp.type] += 1;
      if (d >= today && d <= in7Days) upcomingWithin7Days += 1;
    }
  }

  return NextResponse.json({
    late,
    upcomingWithin7Days,
    byType: CHECKPOINT_TYPES.map((type) => ({ type, count: byType[type] })),
  });
}
