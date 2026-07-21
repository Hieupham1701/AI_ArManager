// Mock telephony / call-stream data for the live operations widgets on the
// analytics console. Replace with a real-time telephony/websocket feed later.

export type LogLevel = "success" | "info" | "warn" | "error";

export interface LogEntry {
  id: number;
  ts: string;
  level: LogLevel;
  event: string;
  msg: string;
}

export const STREAM_PROPS = [
  { key: "SIP Endpoint", val: "sip.agent.io:5060" },
  { key: "Protocol", val: "SIP/2.0 · TLS 1.3" },
  { key: "Codec", val: "G.711 μ-law (PCMU)" },
  { key: "Sample Rate", val: "8 kHz" },
  { key: "Bit Rate", val: "64 kbps" },
  { key: "DTMF Mode", val: "RFC 2833" },
  { key: "RTP Ports", val: "UDP 10000–20000" },
  { key: "SRTP Cipher", val: "AES-128-CM" },
  { key: "Jitter Buffer", val: "40 ms adaptive" },
  { key: "Active Streams", val: "12" },
  { key: "Avg Duration", val: "4 min 32 s" },
  { key: "Packet Loss", val: "0.02%" },
];

export const ACTIVE_SESSIONS = [
  { id: "SES-1042", client: "Northgate Med", dur: "02:14", q: "good" },
  { id: "SES-1043", client: "Riviera Tech", dur: "00:47", q: "fair" },
  { id: "SES-1044", client: "Atlas Consult", dur: "04:01", q: "good" },
];

export function nowTs() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, "0")).join(":");
}

export const LOG_POOL: Omit<LogEntry, "id" | "ts">[] = [
  { level: "success", event: "CALL_CONNECTED", msg: "Outbound call established · Northgate Medical · +15558472193" },
  { level: "info", event: "DATA_RECEIVED", msg: "Webhook payload received · 847 bytes · INV-0847" },
  { level: "success", event: "ACK_SENT", msg: "Payment acknowledgment dispatched · ref #PB-0731" },
  { level: "warn", event: "LATENCY_SPIKE", msg: "RTP jitter 187 ms — exceeds 150 ms threshold" },
  { level: "info", event: "STREAM_INIT", msg: "New RTP session allocated · port 10482" },
  { level: "success", event: "DTMF_RECV", msg: "DTMF '1' received · payment intent confirmed" },
  { level: "error", event: "RETRY_ATTEMPT", msg: "Connection timeout · retrying in 3 s · attempt 2/3" },
  { level: "info", event: "CODEC_NEG", msg: "Codec negotiated: G.711 μ-law 8 kHz 64 kbps" },
  { level: "success", event: "SRTP_OK", msg: "SRTP handshake complete · AES-128-CM active" },
  { level: "warn", event: "JITTER_HIGH", msg: "Jitter buffer scaled to 68 ms · adaptive mode" },
  { level: "error", event: "CALL_DROP", msg: "Session terminated unexpectedly · BYE received" },
  { level: "success", event: "INTENT_DETECT", msg: "AI: Promise-to-Pay · INV-0731 · confidence 94%" },
  { level: "info", event: "SMS_DELIVERED", msg: "SMS receipt confirmed · +15558471234" },
  { level: "success", event: "CALL_COMPLETE", msg: "Call ended · 04:23 · outcome: Promise to Pay" },
  { level: "info", event: "SESSION_CLOSE", msg: "Graceful session end · BYE/200 OK exchanged" },
  { level: "warn", event: "QUEUE_WARN", msg: "Call queue at 80% capacity · 38/50 slots" },
  { level: "success", event: "PAYMENT_RECV", msg: "Webhook: $9,750 confirmed · INV-0301 cleared" },
  { level: "info", event: "AI_DRAFT", msg: "AI follow-up ready · INV-0847 · tone: firm" },
];

export const SEED_LOGS: LogEntry[] = [
  { id: 1, ts: "10:02:14", level: "success", event: "SRTP_OK", msg: "SRTP handshake complete · AES-128-CM active" },
  { id: 2, ts: "10:02:31", level: "info", event: "STREAM_INIT", msg: "New RTP session allocated · port 10482" },
  { id: 3, ts: "10:03:07", level: "success", event: "CALL_CONNECTED", msg: "Outbound established · Northgate Medical · +15558472193" },
  { id: 4, ts: "10:04:22", level: "info", event: "CODEC_NEG", msg: "Codec negotiated: G.711 μ-law 8 kHz 64 kbps" },
  { id: 5, ts: "10:05:01", level: "warn", event: "LATENCY_SPIKE", msg: "RTP jitter 187 ms — exceeds 150 ms threshold" },
  { id: 6, ts: "10:06:18", level: "success", event: "DTMF_RECV", msg: "DTMF '1' received · payment intent confirmed" },
  { id: 7, ts: "10:07:44", level: "info", event: "DATA_RECEIVED", msg: "Webhook payload received · 847 bytes · INV-0847" },
  { id: 8, ts: "10:08:02", level: "error", event: "RETRY_ATTEMPT", msg: "Connection timeout · retrying in 3 s · attempt 2/3" },
  { id: 9, ts: "10:08:33", level: "success", event: "CALL_COMPLETE", msg: "Call ended · 04:23 · outcome: Promise to Pay" },
  { id: 10, ts: "10:09:11", level: "success", event: "INTENT_DETECT", msg: "AI: Promise-to-Pay · INV-0731 · confidence 94%" },
  { id: 11, ts: "10:10:28", level: "info", event: "SMS_DELIVERED", msg: "SMS receipt confirmed · +15558471234" },
  { id: 12, ts: "10:11:05", level: "warn", event: "JITTER_HIGH", msg: "Jitter buffer scaled to 68 ms · adaptive mode" },
  { id: 13, ts: "10:12:19", level: "success", event: "ACK_SENT", msg: "Payment acknowledgment dispatched · ref #PB-0731" },
  { id: 14, ts: "10:13:47", level: "success", event: "PAYMENT_RECV", msg: "Webhook: $9,750 confirmed · INV-0301 cleared" },
  { id: 15, ts: "10:14:03", level: "info", event: "AI_DRAFT", msg: "AI follow-up ready · INV-0847 · tone: firm" },
];

export function levelCfg(level: LogLevel) {
  return {
    success: { ts: "#4ade80", ev: "#22c55e", msg: "#86efac" },
    info: { ts: "#67e8f9", ev: "#22d3ee", msg: "#a5f3fc" },
    warn: { ts: "#fbbf24", ev: "#f59e0b", msg: "#fde68a" },
    error: { ts: "#f87171", ev: "#ef4444", msg: "#fca5a5" },
  }[level];
}

export const BASE_STATS = {
  calls: 47,
  latency: 23,
  throughput: "2.3 MB/s",
  agents: 8,
  uptime: "99.8%",
  streams: 12,
};
