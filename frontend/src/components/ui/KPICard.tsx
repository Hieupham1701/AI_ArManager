import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  valueColor?: string;
}

export default function KPICard({ label, value, sub, icon: Icon, iconColor, iconBg, valueColor }: KPICardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: iconBg }}>
          <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />
        </div>
      </div>
      <p className="font-mono text-lg font-bold leading-none" style={{ color: valueColor ?? "#1a2332" }}>
        {value}
      </p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}
