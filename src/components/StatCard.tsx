import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {icon ? <span className="text-slate-400">{icon}</span> : null}
      </div>
      <div className="mt-3 text-2xl font-bold text-slate-950">{value}</div>
    </div>
  );
}
