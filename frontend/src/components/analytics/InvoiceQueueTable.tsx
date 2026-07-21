import { Fragment } from "react";
import {
  ACCENT,
  filterByOverdue,
  fmt,
  groupInvoices,
  GroupBy,
  INVOICES,
  InvoiceStatus,
  OD_FILTERS,
  OverdueFilter,
  statusCfg,
} from "../../lib/analytics/data";

interface InvoiceQueueTableProps {
  overdueFilter: OverdueFilter;
  setOverdueFilter: (filter: OverdueFilter) => void;
  groupBy: GroupBy;
}

export default function InvoiceQueueTable({
  overdueFilter,
  setOverdueFilter,
  groupBy,
}: InvoiceQueueTableProps) {
  const filtered = filterByOverdue(INVOICES, overdueFilter);
  const groups = groupInvoices(filtered, groupBy);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2">
        {OD_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setOverdueFilter(key)}
            className="rounded-md px-2.5 py-1 text-[10px] font-semibold transition"
            style={
              overdueFilter === key
                ? { background: ACCENT, color: "#fff" }
                : { background: "#eef2f7", color: "#64748b" }
            }
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-slate-500">
          {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="max-h-[420px] overflow-y-auto overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full">
          <thead>
            <tr className="sticky top-0 z-10 border-b border-slate-100 bg-white">
              {["Client", "Invoice ID", "Amount", "Due Date", "Days", "Status"].map((heading) => (
                <th
                  key={heading}
                  className={`whitespace-nowrap py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ${
                    heading === "Amount" ? "pr-4 text-right" : "px-3 text-left"
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map(([groupKey, rows]) => {
              const isStatusGroup = groupBy === "status";
              const cfg = isStatusGroup ? statusCfg(groupKey as InvoiceStatus) : null;
              const groupAmount = rows.reduce((sum, invoice) => sum + invoice.amount, 0);

              return (
                <Fragment key={`group-${groupKey}`}>
                  <tr style={{ background: cfg?.bg ?? "#f8fafc" }}>
                    <td colSpan={6} className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {cfg ? (
                          <span className="h-2 w-2 rounded-full" style={{ background: cfg.dot }} />
                        ) : null}
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: cfg?.text ?? "#1a2332" }}
                        >
                          {isStatusGroup ? cfg?.label : groupKey}
                        </span>
                        <span className="ml-1 text-[10px] text-slate-500">
                          {rows.length} invoice{rows.length !== 1 ? "s" : ""} · {fmt(groupAmount)}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {rows.map((invoice) => {
                    const sc = statusCfg(invoice.status);
                    return (
                      <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs font-medium text-slate-900">
                          {invoice.client}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-slate-500">
                          {invoice.invoiceId}
                        </td>
                        <td className="whitespace-nowrap py-2.5 pr-4 text-right font-mono text-xs font-semibold text-slate-900">
                          {fmt(invoice.amount)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-500">
                          {invoice.dueDate}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <span
                            className="font-mono text-xs font-bold"
                            style={{
                              color:
                                invoice.daysOverdue === 0
                                  ? "#059669"
                                  : invoice.daysOverdue > 60
                                    ? "#dc2626"
                                    : invoice.daysOverdue > 30
                                      ? "#ea580c"
                                      : invoice.daysOverdue > 7
                                        ? "#d97706"
                                        : "#64748b",
                            }}
                          >
                            {invoice.daysOverdue === 0 ? "—" : `${invoice.daysOverdue}d`}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold"
                            style={{ background: sc.bg, color: sc.text }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: sc.dot }} />
                            {sc.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
