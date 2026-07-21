import {
  ACCENT,
  filterByOverdue,
  fmt,
  INVOICES,
  OD_FILTERS,
  OverdueFilter,
  STATUS_ORDER,
  statusCfg,
} from "../../lib/analytics/data";

interface InvoiceAnalyticsPanelProps {
  overdueFilter: OverdueFilter;
  setOverdueFilter: (filter: OverdueFilter) => void;
}

export default function InvoiceAnalyticsPanel({
  overdueFilter,
  setOverdueFilter,
}: InvoiceAnalyticsPanelProps) {
  const groups = STATUS_ORDER.map((status) => ({
    status,
    count: INVOICES.filter((i) => i.status === status).length,
    total: INVOICES.filter((i) => i.status === status).reduce((sum, i) => sum + i.amount, 0),
  }));

  const filtered = filterByOverdue(INVOICES, overdueFilter);

  const done = INVOICES.filter((i) => i.status === "completed").reduce((sum, i) => sum + i.amount, 0);
  const pending = INVOICES.filter((i) => i.status === "in_progress").reduce(
    (sum, i) => sum + i.amount,
    0
  );
  const overdueTotal = INVOICES.filter(
    (i) => i.status !== "completed" && i.status !== "in_progress"
  ).reduce((sum, i) => sum + i.amount, 0);
  const grandTotal = INVOICES.reduce((sum, i) => sum + i.amount, 0);

  return (
    <aside className="flex w-full shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white lg:w-64">
      <div className="border-b border-slate-200 px-4 py-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Invoice Analytics</h2>
        <p className="mt-0.5 text-xs text-slate-500">Status breakdown · {INVOICES.length} total</p>
      </div>

      <div className="space-y-2 border-b border-slate-200 p-3">
        {groups.map(({ status, count, total }) => {
          const cfg = statusCfg(status);
          return (
            <div
              key={status}
              className="flex items-center justify-between rounded-xl border px-3 py-2.5"
              style={{ background: cfg.bg, borderColor: `${cfg.dot}30` }}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: cfg.dot }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: cfg.text }}>
                    {cfg.label}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {count} invoice{count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <p className="font-mono text-xs font-bold" style={{ color: cfg.text }}>
                {fmt(total)}
              </p>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
