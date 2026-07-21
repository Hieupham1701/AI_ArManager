"use client";

import { useEffect, useState } from "react";
import { Database, Phone, Radio, RefreshCw, Shield, Users, Wifi } from "lucide-react";
import { BASE_STATS } from "../../lib/analytics/telephony";

export default function StreamStatusStrip() {
  const [latency, setLatency] = useState(BASE_STATS.latency);
  const [calls, setCalls] = useState(BASE_STATS.calls);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    setUpdatedAt(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setLatency(Math.floor(18 + Math.random() * 12));
      setCalls(Math.floor(44 + Math.random() * 6));
      setUpdatedAt(new Date().toLocaleTimeString());
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { Icon: Phone, label: "Active Calls", val: String(calls), warn: false },
    { Icon: Wifi, label: "Avg Latency", val: `${latency} ms`, warn: latency > 28 },
    { Icon: Database, label: "Throughput", val: BASE_STATS.throughput, warn: false },
    { Icon: Users, label: "Agents Online", val: String(BASE_STATS.agents), warn: false },
    { Icon: Radio, label: "Active Streams", val: String(BASE_STATS.streams), warn: false },
    { Icon: Shield, label: "System Uptime", val: BASE_STATS.uptime, warn: false },
  ];

  return (
    <div className="flex h-10 shrink-0 items-center gap-6 overflow-x-auto rounded-xl border border-slate-200 bg-white px-4">
      {stats.map(({ Icon, label, val, warn }) => (
        <div key={label} className="flex items-center gap-2 whitespace-nowrap">
          <Icon className="h-3 w-3" style={{ color: warn ? "#f59e0b" : "#6b7a90" }} />
          <span className="text-[10px] text-slate-500">{label}</span>
          <span className="font-mono text-[11px] font-bold" style={{ color: warn ? "#d97706" : "#1a2332" }}>
            {val}
          </span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-1.5 whitespace-nowrap text-[10px] text-slate-500">
        <RefreshCw className="h-3 w-3" />
        Updated {updatedAt ?? "--:--:--"}
      </div>
    </div>
  );
}
