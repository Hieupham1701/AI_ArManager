import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Save, RefreshCw, FileText } from "lucide-react";
import TopNav from "./TopNav";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /*const cookieStore = await cookies();
  if (!cookieStore.get("ar_session")) {
    redirect("/login");
  }*/

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <TopNav />

      <main className="flex-1 overflow-y-auto mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">{children}</main>

      {/* Global Footer */}
      <footer className="flex-shrink-0 border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-[#2B85FF] px-5 py-2.5 text-[12px] font-semibold text-white hover:bg-[#1a6fd6] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2B85FF]/20"
          >
            <Save className="h-3.5 w-3.5" />
            Save Strategy
          </button>
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
    </div>
  );
}

