'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  ExternalLink, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

// Design Tokens
const BRAND_PRIMARY = '#2B85FF';
const THEME_BG = '#FAFAFA';

interface Invoice {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
  daysOD: number;
  status: 'Overdue' | 'In Progress' | 'Escalated' | 'Critical';
  risk: 'Low Risk' | 'Med Risk' | 'High Risk';
}

const mockInvoices: Invoice[] = [
  { id: 'INV-2024-0847', client: 'Northgate Medical Group', amount: 24750, dueDate: 'Jun 15, 2026', daysOD: 22, status: 'Overdue', risk: 'Med Risk' },
  { id: 'INV-2024-0731', client: 'Pinebrook Solutions', amount: 8200, dueDate: 'Jun 24, 2026', daysOD: 8, status: 'In Progress', risk: 'Low Risk' },
  { id: 'INV-2024-0612', client: 'Meridian Design Co.', amount: 3500, dueDate: 'May 17, 2026', daysOD: 45, status: 'Escalated', risk: 'High Risk' },
  { id: 'INV-2024-0889', client: 'Vertex Analytics', amount: 41500, dueDate: 'Apr 20, 2026', daysOD: 73, status: 'Critical', risk: 'High Risk' },
];

export default function InvoicesPage() {
  const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState<number | null>(null);

  const selectedInvoice = selectedInvoiceIndex !== null ? mockInvoices[selectedInvoiceIndex] : null;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Overdue': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Escalated': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case 'Low Risk': return 'text-green-600 bg-green-50 border-green-200';
      case 'Med Risk': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'High Risk': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="relative flex flex-1 min-h-0 overflow-hidden bg-[#FAFAFA]">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[16px] font-bold text-slate-900">Invoices</h1>
            <p className="text-[12px] text-slate-500">8 invoices · 7 active</p>
          </div>
          <div className="text-[12px] text-slate-400">
            Click another row to switch · ESC to close
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoices, clients, amounts..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#2B85FF]/20 focus:border-[#2B85FF] transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Invoice ID</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Days OD</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockInvoices.map((inv, idx) => (
                <tr 
                  key={inv.id} 
                  onClick={() => setSelectedInvoiceIndex(idx)}
                  className={`cursor-pointer transition-colors hover:bg-slate-50 ${selectedInvoiceIndex === idx ? 'bg-blue-50/50' : ''}`}
                >
                  <td className="px-4 py-4 text-[12px] font-medium text-[#2B85FF]">
                    <span
                      aria-label={`Open quick view for invoice ${inv.id}`}
                      className="text-left font-medium text-[#2B85FF] transition-colors hover:text-[#1a6fd6]"
                    >
                      {inv.id}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[12px] font-medium text-slate-800">
                    <span
                      aria-label={`Open quick view for ${inv.client}`}
                      className="text-left font-medium text-slate-800 transition-colors hover:text-[#2B85FF]"
                    >
                      {inv.client}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[12px] font-semibold text-slate-900">${inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-4 text-[12px] text-slate-500">{inv.dueDate}</td>
                  <td className="px-4 py-4 text-[12px] font-medium text-amber-600">{inv.daysOD}d</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${getStatusStyle(inv.status)}`}>
                      <span className={`h-1.5 w-1.5 rounded-full bg-current`} />
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${getRiskStyle(inv.risk)}`}>
                      {inv.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick View Panel */}
      {selectedInvoice && (
        <div
          role="complementary"
          aria-label="Invoice quick view"
          className="w-[400px] h-full bg-white border-l border-slate-200 shadow-xl flex flex-col flex-shrink-0"
        >
          <div className="p-6 pb-10 flex-1 overflow-y-auto">
            {/* Panel Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedInvoiceIndex(prev => Math.max(0, (prev || 0) - 1))}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[12px] text-slate-500 font-medium">
                  {(selectedInvoiceIndex || 0) + 1} of {mockInvoices.length}
                </span>
                <button 
                  onClick={() => setSelectedInvoiceIndex(prev => Math.min(mockInvoices.length - 1, (prev || 0) + 1))}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <button 
                onClick={() => setSelectedInvoiceIndex(null)}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>

            <div className="mb-6">
              <div className="text-[12px] text-slate-400 mb-1">{selectedInvoice.id}</div>
              <h2 className="text-[16px] font-bold text-slate-900 mb-3">{selectedInvoice.client}</h2>
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${getStatusStyle(selectedInvoice.status)}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {selectedInvoice.status}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${getRiskStyle(selectedInvoice.risk)}`}>
                  {selectedInvoice.risk}
                </span>
                <span className="text-[12px] text-slate-400">
                  · {selectedInvoice.daysOD} days overdue
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mb-8">
              <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#2B85FF] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-[#1a6fd6] transition-colors shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Generate Reminder
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
              <Link 
                href={`/invoices/${selectedInvoice.id}/strategy`} 
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Full View
              </Link>
            </div>

            {/* Collection Progress */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-semibold text-slate-700">Collection Progress</span>
                <span className="text-[12px] font-medium text-[#2B85FF]">Step 6 of 6</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden mb-2">
                <div className="h-full bg-[#2B85FF] w-full" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Collections Referral</span>
                <span className="font-medium text-[#2B85FF]">100% complete</span>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="mb-4">
              <h3 className="text-[14px] font-bold text-slate-900 mb-4">Invoice Details</h3>
              <div className="space-y-3">
                {[
                  { label: 'Amount Due', value: `$${selectedInvoice.amount.toLocaleString()}` },
                  { label: 'Due Date', value: selectedInvoice.dueDate },
                  { label: 'Days Overdue', value: `${selectedInvoice.daysOD} days`, highlight: 'text-red-600' },
                  { label: 'Strategy', value: 'Collections Referral' },
                  { label: 'Status', value: selectedInvoice.status, isBadge: true },
                  { label: 'Risk', value: selectedInvoice.risk, isBadge: true },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <span className="text-[12px] text-slate-500">{item.label}</span>
                    {item.isBadge ? (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium ${item.label === 'Status' ? getStatusStyle(item.value) : getRiskStyle(item.value)}`}>
                        {item.value}
                      </span>
                    ) : (
                      <span className={`text-[12px] font-medium text-slate-700 ${item.highlight || ''}`}>
                        {item.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
