import { Calendar, Clock, MessageSquare, Send, Workflow, AlertTriangle } from 'lucide-react';
import { NextAction } from '@/types/invoice';

interface NextActionProps {
  action: NextAction;
}

const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'medium':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'low':
      return 'text-green-600 bg-green-50 border-green-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

export default function NextActionCard({ action }: NextActionProps) {
  const rows = [
    { label: 'Action', value: action.action, icon: MessageSquare },
    { label: 'Scheduled', value: `${action.scheduledDate} · ${action.scheduledTime}`, icon: Calendar },
    { label: 'Workflow', value: action.workflow, icon: Workflow },
  ];

  return (
    <div className="flex min-h-[500px] flex-col rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
          <Clock className="h-4 w-4 text-[#4B9CD3]" />
        </div>
        <div>
          <h2 className="text-[16px] font-semibold text-slate-900">Next Scheduled Action</h2>
          <p className="text-[12px] text-slate-500">Queued for execution</p>
        </div>
      </div>

      <div className="space-y-4">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label} className="flex items-center justify-between rounded-[12px] bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-slate-400" />
                <span className="text-[12px] text-slate-500">{row.label}</span>
              </div>
              <span className="text-right text-[12px] font-semibold text-slate-900">{row.value}</span>
            </div>
          );
        })}

        <div className="flex items-center justify-between rounded-[12px] bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-slate-400" />
            <span className="text-[12px] text-slate-500">Priority</span>
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getPriorityStyle(action.priority)}`}>
            {action.priority === 'high' ? 'High Priority' : action.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
          </span>
        </div>
      </div>

      <button className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#2B85FF] px-4 py-3 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#1a6fd6] focus:outline-none focus:ring-2 focus:ring-[#2B85FF] focus:ring-offset-2">
        <Send className="h-4 w-4" />
        Execute Now
      </button>
    </div>
  );
}
