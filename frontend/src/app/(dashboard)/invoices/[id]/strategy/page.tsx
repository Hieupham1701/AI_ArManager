import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  Clock,
  ExternalLink,
  MoreHorizontal,
  TrendingUp,
} from 'lucide-react';
import AIReminder from '@/components/strategy/AIReminder';
import CommunicationHistory from '@/components/strategy/CommunicationHistory';
import NextActionCard from '@/components/strategy/NextAction';
import PrimaryContact from '@/components/strategy/PrimaryContact';
import StrategyTimeline from '@/components/strategy/StrategyTimeline';
import {
  fetchAIInsight,
  fetchCollectionTimeline,
  fetchCommunicationHistory,
  fetchInvoiceDetail,
  fetchNextAction,
  fetchPrimaryContact,
  fetchReminderPreview,
} from '@/lib/api';
import { InvoiceDetail, RiskLevel } from '@/types/invoice';

const BRAND_PRIMARY = '#2B85FF';

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

function statusBadge(status: string) {
  if (status === 'Overdue') {
    return 'border-red-100 bg-red-50 text-red-600';
  }
  if (status === 'Critical') {
    return 'border-red-100 bg-red-50 text-red-600';
  }
  if (status === 'Escalated') {
    return 'border-orange-100 bg-orange-50 text-orange-600';
  }
  if (status === 'In Progress') {
    return 'border-blue-100 bg-blue-50 text-[#4B9CD3]';
  }
  return 'border-slate-100 bg-slate-50 text-slate-600';
}

function riskBadge(risk: RiskLevel) {
  if (risk === 'Low') {
    return 'border-green-100 bg-green-50 text-green-700';
  }
  if (risk === 'Medium') {
    return 'border-amber-100 bg-amber-50 text-amber-700';
  }
  return 'border-red-100 bg-red-50 text-red-600';
}

function InvoiceSummary({ invoice }: { invoice: InvoiceDetail }) {
  const progress = invoice.collectionProgress;

  return (
    <div className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[16px] font-semibold text-slate-900">Invoice Details</h2>
        <ExternalLink className="h-4 w-4 text-slate-400" />
      </div>

      <div className="space-y-3">
        <DetailRow label="Invoice ID" value={invoice.id} />
        <DetailRow label="Client" value={invoice.client} />
        <DetailRow label="Amount Due" value={formatMoney(invoice.amountDue)} />
        <DetailRow label="Due Date" value={invoice.dueDate} />
        <DetailRow
          label="Days Overdue"
          value={`${invoice.daysOverdue} days`}
          valueClassName="text-red-600"
        />
      </div>

      <div className="my-5 h-px bg-slate-100" />

      <div className="space-y-3">
        <DetailRow
          label="Status"
          value={
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusBadge(invoice.status)}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {invoice.status}
            </span>
          }
        />
        <DetailRow
          label="Risk Level"
          value={
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${riskBadge(invoice.riskLevel)}`}>
              <TrendingUp className="h-3 w-3" />
              {invoice.riskLevel} Risk
            </span>
          }
        />
        <DetailRow
          label="Strategy"
          value={
            <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#4B9CD3]">
              {invoice.strategy}
            </span>
          }
        />
      </div>

      <div className="my-5 h-px bg-slate-100" />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[12px] text-slate-500">Collection Progress</span>
          <span className="text-[12px] font-semibold text-[#2B85FF]">
            Step {progress.currentStep} of {progress.totalSteps}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full"
            style={{ width: `${progress.percentComplete}%`, backgroundColor: BRAND_PRIMARY }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>{progress.initiatedLabel ?? 'Initiated Jun 15'}</span>
          <span>{progress.percentComplete}% complete</span>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueClassName = 'text-slate-900',
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[12px] text-slate-500">{label}</span>
      <span className={`text-right text-[12px] font-semibold ${valueClassName}`}>{value}</span>
    </div>
  );
}

export default async function InvoiceStrategyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [
    invoice,
    timeline,
    contact,
    communications,
    reminder,
    nextAction,
    insight,
  ] = await Promise.all([
    fetchInvoiceDetail(id),
    fetchCollectionTimeline(id),
    fetchPrimaryContact(id),
    fetchCommunicationHistory(id),
    fetchReminderPreview(id),
    fetchNextAction(id),
    fetchAIInsight(id),
  ]);

  return (
    <div className="min-h-[calc(100vh-112px)] bg-[#F4F6F8] pb-2 text-slate-900">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-[12px] font-medium text-slate-500">
        <Link href="/invoices" className="hover:text-[#2B85FF]">Invoices</Link>
        <span>{'>'}</span>
        <span>{invoice.id}</span>
        <span>{'>'}</span>
        <span className="font-semibold text-slate-900">Strategy Orchestration</span>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[16px] font-bold text-slate-950">Strategy Orchestration Timeline</h1>
          <p className="mt-1 text-[12px] text-slate-500">
            AI-driven collection sequence for <span className="font-semibold">{invoice.id}</span> · {invoice.client}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[12px] font-semibold text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {invoice.daysOverdue} Days Overdue
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[12px] font-semibold text-[#4B9CD3]">
            <Clock className="h-3 w-3" />
            Active Strategy
          </span>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-slate-700">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6">
          <InvoiceSummary invoice={invoice} />
          <PrimaryContact contact={contact} insight={insight} />
        </div>

        <div className="space-y-6">
          <StrategyTimeline
            steps={timeline}
            title="Collection Strategy Timeline"
            subtitle={`Automated ${invoice.collectionProgress.totalSteps}-stage sequence · ${invoice.collectionProgress.currentStage} active`}
            scheduleStatus={{ label: 'On Schedule', icon: 'clock' }}
          />
          <CommunicationHistory communications={communications} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <NextActionCard action={nextAction} />
        <AIReminder reminder={reminder} />
      </div>
    </div>
  );
}
