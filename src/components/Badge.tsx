import clsx from "clsx";
import type { TypeCheckpoint } from "@prisma/client";
import { CHECKPOINT_BADGE_CLASSES, CHECKPOINT_LABELS, STATUS_BADGE_CLASSES, STATUS_LABELS, type DisplayStatus } from "@/lib/labels";

export function CheckpointTypeBadge({ type }: { type: TypeCheckpoint }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        CHECKPOINT_BADGE_CLASSES[type],
      )}
    >
      {CHECKPOINT_LABELS[type]}
    </span>
  );
}

export function StatusBadge({ status }: { status: DisplayStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_BADGE_CLASSES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
