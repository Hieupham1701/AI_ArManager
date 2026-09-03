"use client";

import { useEffect, useState } from "react";
import { ClientList } from "../../../components/communications/ClientList";
import { ConversationHeader } from "../../../components/communications/ConversationHeader";
import { MessageFeed } from "../../../components/communications/MessageFeed";
import { MessageComposer } from "../../../components/communications/Composer";
import { CommunicationBootstrap, Message, Channel } from "../../../lib/communications/types";
import { getSession } from "../../../lib/auth/session";
import {
	createCommunication,
	generateCommunicationDraft,
	loadCommunicationBootstrap,
	markCommunicationsRead,
	listCommunications,
} from "../../../lib/communications/api";

function uniqueMessages(items: Message[]): Message[] {
	return Array.from(new Map(items.map((message) => [message.id, message])).values());
}


export default function CommunicationsPage() {
  // STATE MANAGEMENT
  const [clients, setClients] = useState<import("../../../lib/communications/types").Client[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
		let active = true;
		const userId = getSession()?.user.id;
		const cacheKey = userId ? `communications_bootstrap:${userId}` : null;
		if (cacheKey) {
			try {
				const cached = sessionStorage.getItem(cacheKey);
				if (cached) {
					const data = JSON.parse(cached) as CommunicationBootstrap;
					setClients(data.clients);
					setMessages(uniqueMessages(data.messages));
					setSelectedClientId(data.clients[0]?.id || "");
					setIsLoading(false);
				}
			} catch {
				sessionStorage.removeItem(cacheKey);
			}
		}

		loadCommunicationBootstrap()
			.then((data) => {
				if (!active) return;
				setClients(data.clients);
				setMessages(uniqueMessages(data.messages));
				setSelectedClientId((current) => current || data.clients[0]?.id || "");
				if (cacheKey) sessionStorage.setItem(cacheKey, JSON.stringify(data));
			})
			.catch((loadError: Error) => {
				if (active) setError(loadError.message);
			})
			.finally(() => {
				if (active) setIsLoading(false);
			});

		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		if (isLoading || clients.length === 0) return;

		let active = true;
		let interval: number | undefined;
		const refreshMessages = async () => {
			if (document.visibilityState !== "visible") return;
			try {
				const loadedMessages = await listCommunications();
				if (active) setMessages(uniqueMessages(loadedMessages));
			} catch {
				// Keep the current conversation visible if a background refresh fails.
			}
		};

		// Bootstrap already loaded the screen. Delay polling so opening Inbox is
		// not immediately followed by another full authenticated request.
		const firstRefresh = window.setTimeout(() => {
			void refreshMessages();
			interval = window.setInterval(() => void refreshMessages(), 10000);
		}, 10000);
		return () => {
			active = false;
			window.clearTimeout(firstRefresh);
			if (interval !== undefined) window.clearInterval(interval);
		};
	}, [clients.length, isLoading]);

  // Get current active client object
  const currentClient = clients.find((c) => c.id === selectedClientId);

  // Get active client messages sorted by timestamp
	  const activeMessages = uniqueMessages(messages
	    .filter((m) => m.clientId === selectedClientId))
	    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // SELECT CLIENT HANDLER: when a client is selected, update state and mark their inbound messages as read
  const handleSelectClient = (id: string) => {
    setSelectedClientId(id);
    setReplyingTo(null); // Clear active reply state when switching clients

    // Mark all inbound messages of this client as read
		const unreadIds = messages
			.filter((msg) => msg.clientId === id && msg.direction === "in" && msg.isRead === false)
			.map((msg) => msg.id);
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.clientId === id && msg.direction === "in" ? { ...msg, isRead: true } : msg
      )
    );
		markCommunicationsRead(unreadIds).catch(() => {
			// Keep the conversation usable if persistence fails; the next refresh
			// will restore the server value and surface the unread state again.
		});
  };

  // Send message handler: when a message is sent, append it to the messages state
	const handleSendMessage = async ({ channel, subject, body }: { channel: Channel; subject?: string; body: string }) => {
		if (!currentClient?.invoiceId) {
			setError("This client does not have an invoice available for communication.");
			return;
		}

		try {
			setError(null);
			const createdMessage = await createCommunication({
				clientId: currentClient.id,
				invoiceId: currentClient.invoiceId,
				channel,
				body,
				subject: channel === "email" ? subject : undefined,
				senderType: "human",
			});
				setMessages((prev) => uniqueMessages([...prev, createdMessage]));
			setReplyingTo(null);
		} catch (sendError) {
			setError(sendError instanceof Error ? sendError.message : "Failed to send message");
		}
	};

	const handleGenerateDraft = async ({
		channel,
		replyTo,
	}: {
		channel: Channel;
		replyTo?: { sender?: string; body?: string; intent?: string };
	}) => {
		if (!currentClient?.invoiceId) {
			throw new Error("This client does not have an invoice available for drafting.");
		}

		return generateCommunicationDraft({
			clientId: currentClient.id,
			invoiceId: currentClient.invoiceId,
			channel,
			tone: "friendly",
			action: "send_reminder",
			replyTo,
		});
	};

  return (
    <div className="-m-8 flex h-[calc(100vh-57px)] w-[calc(100%+4rem)] bg-slate-100 font-sans text-slate-800 overflow-hidden">
		{isLoading && <div className="absolute z-10 inset-0 flex items-center justify-center bg-slate-100/80 text-sm text-slate-500">Loading communications...</div>}
		{error && <div className="absolute z-20 top-4 left-1/2 -translate-x-1/2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
      {/* Client List */}
      <ClientList
        clients={clients}
        messages={messages}
        selectedClientId={selectedClientId}
        onSelectClient={handleSelectClient}
      />

      {/* Header, Feed and Composer */}
      <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-50 border-r border-slate-200 overflow-hidden">
        {/* Fixed Top Header */}
        <ConversationHeader client={currentClient} />

        {/* Scrollable Message Feed */}
        <MessageFeed
          messages={activeMessages}
          onReply={(selectedMsg) => setReplyingTo(selectedMsg)}
        />

        {/* Fixed Bottom Composer */}
        <MessageComposer
          client={currentClient}
          replyingTo={replyingTo}
          recipientEmail={currentClient?.email}
          recipientPhone={currentClient?.phone}
			onCancelReply={() => setReplyingTo(null)}
			onGenerateDraft={handleGenerateDraft}
			onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
