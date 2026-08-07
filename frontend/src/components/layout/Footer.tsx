"use client";

/**
 * Footer component rendered at the bottom of the dashboard layout.
 * It contains three action buttons. The "Save Strategy" button is only
 * displayed when the current route is part of the Strategy feature (i.e.
 * the pathname includes "/strategy"). This prevents the button from
 * appearing on unrelated pages.
 */

import { usePathname } from "next/navigation";
import { Save, RefreshCw, FileText } from "lucide-react";

export default function Footer() {
  // Determine the current route – client side only.
  const pathname = usePathname();
  const isStrategyPage = pathname?.includes("/strategy");

  return (
    <footer className="flex-shrink-0 border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {isStrategyPage && (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2B85FF] px-5 py-2.5 text-[12px] font-semibold text-white hover:bg-[#1a6fd6] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2B85FF]/20"
          >
            <Save className="h-3.5 w-3.5" />
            Save Strategy
          </button>
        )}
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B85FF]/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Timeline
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B85FF]/20"
        >
          <FileText className="h-3.5 w-3.5" />
          View Invoice
        </button>
      </div>
    </footer>
  );
}
