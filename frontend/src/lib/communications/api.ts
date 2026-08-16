import { apiRequest, withAuth } from "../auth/api";
import { getSession } from "../auth/session";
import {
  Client,
  Message,
  Channel,
  SenderType,
  CommunicationBootstrap,
  CommunicationDraft,
  Tone,
} from "./types";

function accessToken(): string {
  const token = getSession()?.access_token;
  if (!token) throw new Error("Your session has expired. Please log in again.");
  return token;
}

export function listCommunicationClients() {
  return apiRequest<Client[]>("/communications/clients", {
    headers: withAuth(accessToken()),
  });
}

export function loadCommunicationBootstrap() {
  return apiRequest<CommunicationBootstrap>("/communications/bootstrap", {
    headers: withAuth(accessToken()),
  });
}

export function listCommunications(clientId?: string) {
  const query = clientId ? `?client_id=${encodeURIComponent(clientId)}` : "";
  return apiRequest<Message[]>(`/communications${query}`, {
    headers: withAuth(accessToken()),
  });
}

export function createCommunication(payload: {
  clientId: string;
  invoiceId: string;
  channel: Channel;
  body: string;
  subject?: string;
  senderType?: SenderType;
  senderName?: string;
  senderInitials?: string;
  senderLabel?: string;
}) {
  return apiRequest<Message>("/communications", {
    method: "POST",
    headers: withAuth(accessToken()),
    body: JSON.stringify(payload),
  });
}

export function generateCommunicationDraft(payload: {
  clientId: string;
  invoiceId: string;
  action?: string;
  channel: Channel;
  tone?: Tone;
  replyTo?: { sender?: string; body?: string; intent?: string };
}) {
  return apiRequest<CommunicationDraft>("/communications/draft", {
    method: "POST",
    headers: withAuth(accessToken()),
    body: JSON.stringify(payload),
  });
}

export function markCommunicationsRead(communicationIds: string[]) {
  if (communicationIds.length === 0) return Promise.resolve();

  return apiRequest<void>("/communications/read", {
    method: "PATCH",
    headers: withAuth(accessToken()),
    body: JSON.stringify({ communicationIds }),
  });
}
