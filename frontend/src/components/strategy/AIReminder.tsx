import { ArrowRight, Send, Sparkles, Zap } from 'lucide-react';
import { ReminderPreview } from '@/types/invoice';

interface AIReminderProps {
  reminder: ReminderPreview;
}

function renderReminderBody(reminder: ReminderPreview) {
  const lines = reminder.body.split('\n');
  const invoiceId = reminder.body.match(/INV-\d{4}-\d{4}/)?.[0] ?? 'INV-2024-0847';
  const amount = reminder.body.match(/\$[\d,]+(?:\.\d{2})?/)?.[0] ?? '$24,750.00';
  const dueDate =
    reminder.body.match(
      /(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}/,
    )?.[0] ?? 'June 15, 2026';
  const overdueText = reminder.body.match(/\d+ days past due/)?.[0] ?? '22 days past due';

  return lines.map((line, index) => {
    if (line.trim() === '') {
      return <div key={`space-${index}`} className="h-3" />;
    }

    if (line.startsWith('Pay Invoice')) {
      return (
        <div key="pay-card" className="my-4 rounded-[12px] border border-blue-100 bg-blue-50/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[12px] font-semibold text-[#4B9CD3]">
                Pay Invoice — {amount}
              </div>
              <div className="text-[11px] text-slate-500">Secure payment · {invoiceId}</div>
            </div>
            <button className="inline-flex shrink-0 items-center gap-1 rounded-[10px] bg-[#2B85FF] px-3 py-1.5 text-[11px] font-semibold text-white">
              Pay Now
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      );
    }

    if (line.startsWith('Secure payment')) {
      return null;
    }

    if (line.includes(invoiceId) && line.includes('days past due')) {
      return (
        <p key={index} className="mb-1 text-[12px] leading-relaxed text-slate-700">
          {line.split('invoice ')[0]}invoice{' '}
          <span className="font-semibold text-[#4B9CD3]">{invoiceId}</span> for{' '}
          <span className="font-semibold text-slate-900">{amount}</span>, which was due on{' '}
          <span className="font-semibold text-slate-900">{dueDate}</span> and is currently{' '}
          <span className="font-semibold text-red-600">{overdueText}.</span>
        </p>
      );
    }

    return (
      <p key={index} className="mb-1 text-[12px] leading-relaxed text-slate-700">
        {line}
      </p>
    );
  });
}

export default function AIReminder({ reminder }: AIReminderProps) {
  return (
    <div className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
            <Sparkles className="h-4 w-4 text-[#4B9CD3]" />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold text-slate-900">AI Reminder Preview</h2>
            <p className="text-[12px] text-slate-500">Generated · Pending approval</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[12px] font-semibold text-[#4B9CD3]">
          <Zap className="h-3.5 w-3.5" />
          AI Generated
        </span>
      </div>

      <div className="overflow-hidden rounded-[12px] border border-slate-200 bg-white">
        <div className="space-y-3 bg-slate-50/70 p-4">
          <div>
            <div className="mb-1 text-[12px] text-slate-500">From</div>
            <div className="text-[12px] font-semibold text-slate-900">{reminder.from}</div>
          </div>
          <div>
            <div className="mb-1 text-[12px] text-slate-500">To</div>
            <div className="text-[12px] font-semibold text-slate-900">{reminder.to}</div>
          </div>
          <div>
            <div className="mb-1 text-[12px] text-slate-500">Subject</div>
            <div className="text-[12px] font-semibold text-slate-900">{reminder.subject}</div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-5">
          {renderReminderBody(reminder)}
        </div>
      </div>

      <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#2B85FF] px-4 py-3 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#1a6fd6] focus:outline-none focus:ring-2 focus:ring-[#2B85FF] focus:ring-offset-2">
        <Send className="h-4 w-4" />
        Send Reminder
      </button>
    </div>
  );
}
