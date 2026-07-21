"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, DollarSign, FileText } from "lucide-react";
import ChartCard from "../../../components/ui/ChartCard";
import KPICard from "../../../components/ui/KPICard";
import InvoiceQueueTable from "../../../components/analytics/InvoiceQueueTable";
import InvoiceAnalyticsPanel from "../../../components/analytics/InvoiceAnalyticsPanel";
import StreamStatusStrip from "../../../components/analytics/StreamStatusStrip";
import TelephonyPanel from "../../../components/analytics/TelephonyPanel";
import CollectionTrendChart from "../../../components/charts/CollectionTrendChart";
import {
  ACCENT,
  fmt,
  getPortfolioSummary,
  GroupBy,
  INVOICES,
  OverdueFilter,
} from "../../../lib/analytics/data";

export default function AnalyticsPage() {
  const [overdueFilter, setOverdueFilter] = useState<OverdueFilter>("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("status");
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  const summary = getPortfolioSummary();

  useEffect(() => {
    const format = () => new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
    setCurrentTime(format());
    const timer = setInterval(() => setCurrentTime(format()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      <section>
        <h5> <b>AR Financial Metrics</b> </h5>
        <p>
          Accounts receivable analytics : {currentTime ?? "—"}  
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total Portfolio"
          value={fmt(summary.total)}
          sub={`${INVOICES.length} active invoices`}
          icon={DollarSign}
          iconColor="#1a2332"
          iconBg="#eef2f7"
        />
        <KPICard
          label="Collected"
          value={fmt(summary.collected)}
          sub={`${summary.collectionRate}% collection rate`}
          icon={CheckCircle}
          iconColor="#059669"
          iconBg="#ecfdf5"
          valueColor="#059669"
        />
        <KPICard
          label="Outstanding"
          value={fmt(summary.outstanding)}
          sub="Pending across open invoices"
          icon={FileText}
          iconColor={ACCENT}
          iconBg="rgba(75, 156, 211, 0.1)"
          valueColor={ACCENT}
        />
        <KPICard
          label="At Risk (critical + escalated)"
          value={fmt(summary.atRisk)}
          sub="Requires immediate follow-up"
          icon={AlertCircle}
          iconColor="#dc2626"
          iconBg="#fef2f2"
          valueColor="#dc2626"
        />
      </section>

      <StreamStatusStrip />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <TelephonyPanel />

        <div className="min-w-0 flex-1 space-y-6">
          <ChartCard
            title="Collection Trend — 6 Months"
            description="Cash collected vs. outstanding balance, by month"
          >
            <CollectionTrendChart />
          </ChartCard>

          <ChartCard
            title="Invoice Queue"
            description="Grouped invoice list with overdue filtering"
            actions={
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
                {(["status", "client"] as GroupBy[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGroupBy(g)}
                    className="rounded-md px-2.5 py-1 text-[10px] font-medium capitalize transition-all"
                    style={
                      groupBy === g
                        ? { background: "white", color: ACCENT, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }
                        : { color: "#64748b" }
                    }
                  >
                    By {g}
                  </button>
                ))}
              </div>
            }
          >
            <InvoiceQueueTable
              overdueFilter={overdueFilter}
              setOverdueFilter={setOverdueFilter}
              groupBy={groupBy}
            />
          </ChartCard>
        </div>

        <InvoiceAnalyticsPanel overdueFilter={overdueFilter} setOverdueFilter={setOverdueFilter} />
      </div>
    </div>
  );
}

