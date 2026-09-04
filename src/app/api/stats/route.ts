import { NextResponse } from "next/server";
import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { toUTCMidnight } from "@/lib/dates";
import { CHECKPOINT_TYPES, deriveDisplayStatus } from "@/lib/checkpoints";
import type { TypeCheckpoint } from "@prisma/client";

/** Bandeau de stats du dashboard : retards, échéances sous 7 jours, répartition par type. */
export async function GET() {
  const checkpoints = await prisma.checkpoint.findMany();

  const today = toUTCMidnight(new Date());
  const in7Days = addDays(today, 7);

  let late = 0;
  let upcomingWithin7Days = 0;
  const byType: Record<TypeCheckpoint, number> = { S1: 0, M2: 0, M4: 0, M6: 0 };

  for (const cp of checkpoints) {
    const displayStatus = deriveDisplayStatus(cp);
    if (displayStatus === "EN_RETARD") {
      late += 1;
    } else if (displayStatus === "A_VENIR") {
      byType[cp.type] += 1;
      const d = toUTCMidnight(cp.datePrevue);
      if (d >= today && d <= in7Days) upcomingWithin7Days += 1;
    }
  }

  return NextResponse.json({
    late,
    upcomingWithin7Days,
    byType: CHECKPOINT_TYPES.map((type) => ({ type, count: byType[type] })),
  });
}
