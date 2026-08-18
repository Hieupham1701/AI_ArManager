// Mock telephony / call-stream data for the live operations widgets on the
// analytics console. Replace with a real-time telephony/websocket feed later.

export type LogLevel = "success" | "info" | "warn" | "error";


export const STREAM_PROPS = [
  { key: "WebSocket Status", val: "Connected" },
  { key: "Active Sessions", val: "3" },
  { key: "Session Duration", val: "12m 45s" },
  { key: "Audio Chunks Received", val: "1,247" },
  { key: "Inbound Bytes", val: "2.4 MB" },
  { key: "Outbound Bytes", val: "1.8 MB" },
  { key: "Average Latency", val: "245ms" },
  { key: "Transcription Latency", val: "180ms" },
  { key: "AI Response Latency", val: "520ms" },
  { key: "Detected Intent", val: "Payment Inquiry" },
  { key: "Confidence", val: "94.2%" },
  { key: "Payment Date", val: "Today" },
  { key: "Connection Errors", val: "0" },
];


export function levelCfg(level: LogLevel) {
  return {
    success: { ts: "#4ade80", ev: "#22c55e", msg: "#86efac" },
    info: { ts: "#67e8f9", ev: "#22d3ee", msg: "#a5f3fc" },
    warn: { ts: "#fbbf24", ev: "#f59e0b", msg: "#fde68a" },
    error: { ts: "#f87171", ev: "#ef4444", msg: "#fca5a5" },
  }[level];
}
