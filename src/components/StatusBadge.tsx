import { clsx } from "clsx";
import { statusLabels, statusTone } from "@/lib/format";
import type { GuestStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: GuestStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1",
        statusTone[status]
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
