'use client';

import {
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Clock,
  Phone,
  Calendar,
} from 'lucide-react';
import { CollectionStep, CollectionStepStatus } from '@/types/invoice';

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

export interface StrategyTimelineProps {
  steps: CollectionStep[];
  title?: string;
  subtitle?: string;
  scheduleStatus?: {
    label: string;
    icon?: 'clock' | 'alert';
  };
  compact?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Design tokens                                                       */
/* ------------------------------------------------------------------ */

const BRAND_PRIMARY = '#2B85FF';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function getStepIcon(icon: string) {
  const props = { className: 'h-4 w-4' } as const;
  switch (icon) {
    case 'check':
      return <CheckCircle2 {...props} />;
    case 'message':
      return <MessageSquare {...props} />;
    case 'alert':
      return <AlertCircle {...props} />;
    case 'clock':
      return <Clock {...props} />;
    case 'phone':
      return <Phone {...props} />;
    default:
      return <CheckCircle2 {...props} />;
  }
}

function getStepIconColor(status: CollectionStepStatus) {
  switch (status) {
    case 'completed':
      return '#10b981';
    case 'active':
      return BRAND_PRIMARY;
    case 'pending':
      return '#94a3b8'; // slate-400
    default:
      return '#94a3b8';
  }
}

function getStepIconBg(status: CollectionStepStatus) {
  switch (status) {
    case 'completed':
      return '#ecfdf5';
    case 'active':
      return '#e8f3ff';
    case 'pending':
      return '#f1f5f9'; // slate-100
    default:
      return '#f1f5f9';
  }
}

function getStepCardClasses(status: CollectionStepStatus) {
  switch (status) {
    case 'completed':
      return 'bg-[#F0FDF7] border-[#C7F3DE]';
    case 'active':
      return 'bg-white border-[#BFE1FF] shadow-[0_0_0_1px_rgba(43,133,255,0.08)]';
    case 'pending':
      return 'bg-white border-slate-100';
    default:
      return 'bg-white border-slate-100';
  }
}

function StatusBadge({ status }: { status: CollectionStepStatus }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Completed
      </span>
    );
  }
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#2B85FF] px-2 py-0.5 text-[11px] font-medium text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
      Pending
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export default function StrategyTimeline({
  steps,
  title = 'Collection Strategy Timeline',
  subtitle,
  scheduleStatus,
  compact = false,
}: StrategyTimelineProps) {
  return (
    <div className="h-full rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-semibold text-slate-800">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-[12px] text-slate-500">{subtitle}</p>
          )}
        </div>
        {scheduleStatus && (
          <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[12px] font-medium text-[#4B9CD3]">
            {scheduleStatus.icon === 'clock' && <Clock className="h-3 w-3" />}
            {scheduleStatus.icon === 'alert' && <AlertCircle className="h-3 w-3" />}
            {scheduleStatus.label}
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute bottom-3 left-[23px] top-3 w-0.5 bg-slate-200" />

        <div className={compact ? 'space-y-4' : 'space-y-5'}>
          {steps.map((step, index) => {
            const iconColor = getStepIconColor(step.status);
            const iconBg = getStepIconBg(step.status);
            const cardClasses = getStepCardClasses(step.status);

            return (
              <div key={`${step.day}-${step.title}-${index}`} className="relative flex gap-5">
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] bg-white shadow-sm"
                    style={{ borderColor: iconColor }}
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full"
                      style={{ backgroundColor: iconBg, color: iconColor }}
                    >
                      {getStepIcon(step.icon)}
                    </div>
                  </div>
                </div>

                <div className={`flex-1 rounded-[12px] border px-5 py-4 ${cardClasses}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-[#4B9CD3]">
                          Day {step.day}
                        </span>
                        <StatusBadge status={step.status} />
                      </div>

                      <h3 className="text-[12px] font-semibold text-slate-900">
                        {step.title}
                      </h3>

                      <p className="mt-1 text-[12px] text-slate-500 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 text-[12px] text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {step.date}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
