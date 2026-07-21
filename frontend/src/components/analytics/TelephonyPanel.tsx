"use client";

import { useEffect, useRef, useState } from "react";
import { Cpu, Signal } from "lucide-react";
import {
  ACTIVE_SESSIONS,
  LOG_POOL,
  LogEntry,
  SEED_LOGS,
  STREAM_PROPS,
  levelCfg,
  nowTs,
} from "../../lib/analytics/telephony";

export default function TelephonyPanel() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>(SEED_LOGS);
  const logCounter = useRef(SEED_LOGS.length + 1);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const pick = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)];
      setLogEntries((prev) => [...prev.slice(-35), { id: logCounter.current++, ts: nowTs(), ...pick }]);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logEntries]);

  return (
    <aside
      className="flex w-full shrink-0 flex-col overflow-hidden rounded-xl border border-slate-800 lg:w-64"
      style={{ background: "#0f1117" }}
    >
      <div className="max-h-80 flex-1 overflow-y-auto lg:max-h-none">
        <div
          className="sticky top-0 flex items-center gap-2 border-b px-4 py-3"
          style={{ background: "#0f1117", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <Cpu className="h-3.5 w-3.5" style={{ color: "#4b9cd3" }} />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Stream Properties
          </span>
          <div className="ml-auto flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-emerald-500">Active</span>
          </div>
        </div>

        <div className="space-y-2 px-4 py-3">
          {STREAM_PROPS.map(({ key, val }) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="shrink-0 font-mono text-[10px] text-slate-600">{key}</span>
              <span className="text-right font-mono text-[11px] font-medium text-cyan-400">{val}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 px-4 pb-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-700">
            Active Sessions
          </p>
          {ACTIVE_SESSIONS.map(({ id, client, dur, q }) => (
            <div
              key={id}
              className="flex items-center justify-between rounded-lg px-3 py-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div>
                <p className="font-mono text-[10px] text-cyan-400">{id}</p>
                <p className="text-[10px] text-slate-500">{client}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] text-slate-200">{dur}</p>
                <p className="text-[10px]" style={{ color: q === "good" ? "#22c55e" : "#f59e0b" }}>
                  {q}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="flex flex-col overflow-hidden border-t"
        style={{ borderColor: "rgba(255,255,255,0.07)", flex: "0 0 260px" }}
      >
        <div
          className="flex items-center gap-2 border-b px-4 py-2.5"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <Signal className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Connection Log
          </span>
          <div className="ml-auto flex items-center gap-1">
            <div className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500 opacity-60" />
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        <div
          ref={logRef}
          className="flex-1 space-y-1 overflow-y-auto px-3 py-2 font-mono"
          style={{ scrollbarWidth: "none" }}
        >
          {logEntries.map((entry) => {
            const c = levelCfg(entry.level);
            return (
              <div key={entry.id} className="flex gap-2 leading-relaxed">
                <span className="shrink-0 text-[10px]" style={{ color: c.ts }}>
                  [{entry.ts}]
                </span>
                <span className="w-[82px] shrink-0 text-[10px] font-bold" style={{ color: c.ev }}>
                  {entry.event}
                </span>
                <span className="break-words text-[10px] text-slate-500">{entry.msg}</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
