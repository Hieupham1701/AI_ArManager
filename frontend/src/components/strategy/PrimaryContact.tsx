import { Bot, Mail, Phone, User } from 'lucide-react';
import { AIInsight, Contact } from '@/types/invoice';

interface PrimaryContactProps {
  contact: Contact;
  insight?: AIInsight;
}

export default function PrimaryContact({ contact, insight }: PrimaryContactProps) {
  return (
    <div className="rounded-[12px] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <h2 className="mb-5 text-[16px] font-semibold text-slate-900">Primary Contact</h2>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#4B9CD3]">
          <User className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[12px] font-semibold text-slate-900">{contact.name}</div>
          <div className="text-[12px] text-slate-500">{contact.role}</div>
        </div>
      </div>

      <div className="space-y-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[#4B9CD3]">
            <Mail className="h-3.5 w-3.5" />
          </span>
          <span className="truncate text-[12px] text-slate-700">{contact.email}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[#4B9CD3]">
            <Phone className="h-3.5 w-3.5" />
          </span>
          <span className="text-[12px] text-slate-700">{contact.phone}</span>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[12px] text-slate-500">Last Contact</span>
          <span className="text-[12px] font-semibold text-slate-800">{contact.lastContact}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[12px] text-slate-500">Response Rate</span>
          <span className="text-[12px] font-semibold text-[#2B85FF]">{contact.responseRate}%</span>
        </div>
      </div>

      {insight && (
        <div className="mt-5 rounded-[12px] border border-blue-100 bg-blue-50/60 p-4">
          <div className="mb-3 flex items-center gap-2 text-[#4B9CD3]">
            <Bot className="h-4 w-4" />
            <span className="text-[12px] font-semibold">AI Insight</span>
          </div>
          <p className="text-[12px] leading-relaxed text-slate-700">{insight.summary}</p>
        </div>
      )}
    </div>
  );
}
