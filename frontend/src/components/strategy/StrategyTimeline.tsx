'use client';

import { useState } from 'react';
import { 
  Bot, 
  Bell, 
  Settings, 
  ChevronRight, 
  ExternalLink, 
  Save, 
  RefreshCw, 
  HelpCircle,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Clock,
  MoreVertical
} from 'lucide-react';

// Design Tokens
const BRAND_PRIMARY = '#2B85FF';
const THEME_BG = '#FAFAFA';
const THEME_BG_LIGHT = '#F4F5F7';
const THEME_BG_WHITE = '#FFFFFF';
const BORDER_COLOR = 'rgba(26, 35, 50, 0.09)';
const TEXT_HEADER = '#1e293b';
const TEXT_BODY = '#64748b';

// TypeScript Interfaces
interface Invoice {
  id: string;
  client: string;
  amountDue: number;
  dueDate: string;
  daysOverdue: number;
  status: 'Overdue' | 'Paid' | 'Pending';
  riskLevel: 'Low' | 'Medium' | 'High';
  strategy: string;
}

interface CollectionStep {
  day: number;
  title: string;
  date: string;
  status: 'completed' | 'active' | 'pending';
  icon: 'check' | 'message' | 'alert' | 'clock';
}

interface StrategyTimelineProps {
  invoice?: Invoice;
  steps?: CollectionStep[];
  onSave?: () => void;
  onRefresh?: () => void;
  onViewInvoice?: () => void;
}

// Mock Data
const mockInvoice: Invoice = {
  id: 'INV-2024-0847',
  client: 'Northgate Medical Group',
  amountDue: 24750.00,
  dueDate: 'June 15, 2026',
  daysOverdue: 22,
  status: 'Overdue',
  riskLevel: 'Medium',
  strategy: 'Auto-Collection v2'
};

interface CollectionStepExtended extends CollectionStep {
  description: string;
}

const mockSteps: CollectionStepExtended[] = [
  {
    day: 0,
    title: 'Invoice Issued',
    description: 'Initial invoice delivered to client billing contact via email',
    date: 'Jun 15, 2026',
    status: 'completed',
    icon: 'check'
  },
  {
    day: 3,
    title: 'Friendly Email',
    description: 'Courtesy payment reminder dispatched automatically',
    date: 'Jun 18, 2026',
    status: 'completed',
    icon: 'check'
  },
  {
    day: 7,
    title: 'Reminder SMS',
    description: 'Automated SMS notification sent to registered billing contact',
    date: 'Jun 22, 2026',
    status: 'active',
    icon: 'message'
  }
];

export default function StrategyTimeline({
  invoice = mockInvoice,
  steps = mockSteps,
  onSave,
  onRefresh,
  onViewInvoice
}: StrategyTimelineProps) {
  const [isAutoSaveOn, setIsAutoSaveOn] = useState(true);
  const [lastUpdated] = useState('Jun 22, 2026 at 10:15 AM');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Overdue':
        return 'text-red-600';
      case 'Paid':
        return 'text-green-600';
      case 'Pending':
        return 'text-yellow-600';
      default:
        return 'text-slate-600';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-green-600';
      case 'Medium':
        return 'text-amber-600';
      case 'High':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  const getStepIcon = (icon: string) => {
    switch (icon) {
      case 'check':
        return <CheckCircle2 className="h-5 w-5" />;
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5" />;
      case 'clock':
        return <Clock className="h-5 w-5" />;
      default:
        return <CheckCircle2 className="h-5 w-5" />;
    }
  };

  const getStepBg = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'active':
        return 'bg-blue-50 border-blue-200';
      case 'pending':
        return 'bg-slate-50 border-slate-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getStepIconColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#16a34a';
      case 'active':
        return BRAND_PRIMARY;
      case 'pending':
        return '#64748b';
      default:
        return '#64748b';
    }
  };

  const getStepIconBg = (status: string) => {
    switch (status) {
      case 'completed':
        return '#dcfce7';
      case 'active':
        return '#dbeafe';
      case 'pending':
        return '#f1f5f9';
      default:
        return '#f1f5f9';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      
      {/* Breadcrumb & Page Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2 text-[12px] text-slate-500 mb-2">
          <span className="hover:text-[#2B85FF] cursor-pointer">Invoices</span>
          <ChevronRight className="h-3 w-3" />
          <span className="hover:text-[#2B85FF] cursor-pointer">{invoice.id}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#2B85FF] font-medium">Strategy Orchestration</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[16px] font-semibold text-slate-800 mb-1">Strategy Orchestration Timeline</h1>
            <p className="text-[12px] text-slate-500">
              AI-driven collection sequence for {invoice.id} · {invoice.client}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[12px] font-medium text-red-700">
              <AlertCircle className="h-3 w-3" />
              {invoice.daysOverdue} Days Overdue
            </span>
            <div className="relative">
              <button className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[12px] font-medium text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Active Strategy
              </button>
              <button className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600">
                <MoreVertical className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-6 p-6">
        {/* Left Panel - Invoice Details */}
        <div className="w-1/3">
          <div className="rounded-xl border border-[rgba(26,35,50,0.09)] bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-semibold text-slate-800 flex items-center gap-2">
                Invoice Details
                <ExternalLink className="h-4 w-4 text-slate-400 hover:text-[#2B85FF]" />
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[12px] text-slate-500">Invoice ID</span>
                <span className="text-[12px] font-medium text-slate-800">{invoice.id}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[12px] text-slate-500">Client</span>
                <span className="text-[12px] font-medium text-slate-800">{invoice.client}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[12px] text-slate-500">Amount Due</span>
                <span className="text-[12px] font-medium text-slate-800">${invoice.amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[12px] text-slate-500">Due Date</span>
                <span className="text-[12px] font-medium text-slate-800">{invoice.dueDate}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[12px] text-slate-500">Days Overdue</span>
                <span className={`text-[12px] font-medium ${invoice.daysOverdue > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                  {invoice.daysOverdue} days
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-slate-500">Status</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${getStatusColor(invoice.status)}`}>
                  <AlertCircle className="h-3 w-3" />
                  {invoice.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-slate-500">Risk Level</span>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${getRiskColor(invoice.riskLevel)}`}>
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {invoice.riskLevel} Risk
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-slate-500">Strategy</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[12px] font-medium text-blue-700">
                  {invoice.strategy}
                </span>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-slate-500">Collection Progress</span>
                <span className="text-[12px] font-medium text-[#2B85FF]">Step 3 of 6</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-[#2B85FF] transition-all duration-500" 
                  style={{ width: '40%' }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[12px] text-slate-500">
                <span>Initiated {invoice.dueDate}</span>
                <span>40% complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Collection Strategy Timeline */}
        <div className="w-2/3">
          <div className="rounded-xl border border-[rgba(26,35,50,0.09)] bg-white p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[16px] font-semibold text-slate-800">Collection Strategy Timeline</h2>
                <p className="text-[12px] text-slate-500">Automated 6-stage sequence · Day 7 active</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] font-medium text-slate-600">
                <Clock className="h-3 w-3" />
                On Schedule
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
              
              {/* Steps */}
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={step.day} className="relative flex gap-4">
                    {/* Day Number */}
                    <div className="flex flex-col items-center">
                      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white shadow-sm" style={{ borderColor: getStepIconColor(step.status) }}>
                        <div 
                          className="h-6 w-6 rounded-full flex items-center justify-center" 
                          style={{ backgroundColor: getStepIconBg(step.status) }}
                        >
                          {getStepIcon(step.icon)}
                        </div>
                      </div>
                      <div className="mt-2 text-[12px] font-medium text-slate-600">Day {step.day}</div>
                    </div>

                    {/* Step Card */}
                    <div className={`flex-1 rounded-xl border p-4 ${getStepBg(step.status)}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-[14px] font-semibold text-slate-800">{step.title}</h3>
                            {step.status === 'active' && (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2B85FF] text-white text-[10px] font-medium">
                                ●
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] text-slate-500">{step.date}</p>
                        </div>
                        {step.status === 'active' && (
                          <div className="h-5 w-5 rounded-full border-2 border-[#2B85FF] shadow-[0_0_0_3px_rgba(43,133,255,0.2)]" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onSave}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2B85FF] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#1a6fd6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B85FF] focus:ring-offset-2"
            >
              <Save className="h-4 w-4" />
              Save Strategy
            </button>
            <button 
              onClick={onRefresh}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#2B85FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B85FF] focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Timeline
            </button>
            <button 
              onClick={onViewInvoice}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-[12px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#2B85FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B85FF] focus:ring-offset-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Invoice
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <span>Last updated</span>
              <span className="font-medium text-slate-700">{lastUpdated}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium ${isAutoSaveOn ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {isAutoSaveOn ? '✓' : '○'}
              </span>
              <span className="text-[12px] font-medium text-slate-700">Auto-save on</span>
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-[#2B85FF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B85FF] focus:ring-offset-2">
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
