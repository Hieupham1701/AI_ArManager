'use client';

import { useEffect, useState } from 'react';
import {
  ACCENT,
  fmt,
  STATUS_ORDER,
  statusCfg,
    normalizeApiStatus,
} from "../../lib/analytics/data";
import { fetchAnalytics } from "../../lib/api";
import type { AnalyticsResponse, InvoiceStatusAggregate } from "@/types/invoice";

interface InvoiceAnalyticsPanelProps {
  overdueFilter?: string;
  setOverdueFilter?: (filter: string) => void;
}

interface AnalyticsGroup {
  status: string;
  count: number;
  total: number;
}

export default function InvoiceAnalyticsPanel({
  overdueFilter,
  setOverdueFilter,
}: InvoiceAnalyticsPanelProps) {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  // Map API response to display format, grouping by status
  const groups: AnalyticsGroup[] = analytics?.byStatus.map((item) => ({
    status: item.status,
    count: item.count,
    total: item.totalAmount,
  })) ?? [];

  // Calculate totals from the API response
  const done = analytics?.byStatus.find((s) => s.status === 'Paid')?.totalAmount ?? 0;
  const pending = analytics?.byStatus.find((s) => s.status === 'In Progress')?.totalAmount ?? 0;
  const overdueTotal = ((analytics?.byStatus.find((s) => s.status === 'Critical')?.totalAmount ?? 0) +
    (analytics?.byStatus.find((s) => s.status === 'Escalated')?.totalAmount ?? 0) +
    (analytics?.byStatus.find((s) => s.status === 'Overdue')?.totalAmount ?? 0));
  const grandTotal = analytics?.totalAmount ?? 0;
  const totalInvoices = analytics?.totalInvoices ?? 0;

  return (
    <aside className="flex w-full shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white lg:w-64">
      <div className="border-b border-slate-200 px-4 py-3.5">
        <h2 className="text-sm font-semibold text-slate-900">Invoice Analytics</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {loading ? 'Loading...' : `Status breakdown · ${totalInvoices} total`}
        </p>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-2 border-b border-slate-200 p-3">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          groups.map(({ status, count, total }) => {
            const normalizedStatus = normalizeApiStatus(status);
            const cfg = statusCfg(normalizedStatus);
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
          })
        )}
      </div>
    </aside>
  );
}
