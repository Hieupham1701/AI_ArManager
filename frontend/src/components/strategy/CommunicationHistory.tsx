import { FileText, Mail, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';
import { CommunicationLog } from '@/types/invoice';

interface CommunicationHistoryProps {
  communications: CommunicationLog[];
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'invoice_delivery':
      return <FileText className="h-4 w-4" />;
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'sms':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <Mail className="h-4 w-4" />;
  }
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'text-green-700 bg-green-100 border-green-100';
    case 'sent':
      return 'text-[#4B9CD3] bg-blue-50 border-blue-100';
    case 'failed':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

const getStatusIcon = (status: string) => {
  if (status === 'delivered') {
    return <CheckCircle2 className="h-3 w-3" />;
  }
  return <ArrowRight className="h-3 w-3" />;
};

export default function CommunicationHistory({ communications }: CommunicationHistoryProps) {
  const deliveredCount = communications.filter(c => c.status === 'delivered').length;

  return (
    <div className="h-full rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-slate-900">Communication History</h2>
        <span className="cursor-pointer text-[12px] font-semibold text-[#4B9CD3] hover:text-[#2B85FF]">View all</span>
      </div>
      
      <p className="text-[12px] text-slate-500 mb-4">
        {communications.length} attempts · {deliveredCount} confirmed delivered
      </p>

      <div className="space-y-3.5">
        {communications.map((comm) => (
          <div key={comm.id} className="rounded-[12px] border border-slate-200 bg-white p-4 shadow-[0_1px_1px_rgba(15,23,42,0.03)]">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[#4B9CD3]">
                  {getTypeIcon(comm.type)}
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-slate-900">{comm.title}</div>
                  <div className="text-[11px] text-slate-400">{comm.date} · {comm.time}</div>
                </div>
              </div>
              <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getStatusStyle(comm.status)}`}>
                {getStatusIcon(comm.status)}
                {comm.status === 'delivered' ? 'Delivered' : comm.status === 'sent' ? 'Sent' : comm.status}
              </span>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed">{comm.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
