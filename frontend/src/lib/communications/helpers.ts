import { Channel, Intent, Message, OutStatus, Client } from "./types";
import { mockClients, mockMessages } from "./mockData";

// HELPER FUNCTIONS
// Message Status configuration helper
export function statusConf(status?: OutStatus) {
	if (!status) return null;
	switch (status) {
		case "delivered":
			return { label: "Delivered", color: "#10b94e" };
		case "failed":
			return { label: "Failed", color: "#ef4444" };
		case "sent":
			return { label: "Sent", color: "#6b7280" };
	}
}


// Intent configuration helper
export function intentConf(intent?: Intent) {
	if (!intent) return null;
	switch (intent) {
		case "dispute":
			return { label: "Intent: Dispute", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
		case "promise_to_pay":
			return { label: "Promise to Pay", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
		case "invoice_request":
			return { label: "Invoice Request", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" };
		case "other":
		default:
			return { label: "General Note", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" };
	}
}


// Overdue Days configuration helper
export function overdueConf(days: number) {
	if (days === 0) {
		return { label: "Current", bg: "#ecfdf5", text: "#05964d", border: "#ecfdf5", };
	}
	if (days <= 7) {
		return {
			label: `${days}d overdue`, bg: "#e5e5e4cb", text: "#717171",
			border: "#e5e5e4cb",
		};
	}
	if (days <= 30) {
		return {
			label: `${days}d overdue`, bg: "#fae0bd", text: "#df972b", border: "#fae0bd",
		};
	}
	return {
		label: `${days}d overdue`, bg: "#fed1d1", text: "#dc2626",
		border: "#fed1d1",
	};
}

// Helper function to format numbers as USD currency ($)
export function formatCurrency(n: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(n);
}

// Helper function to format ISO timestamp strings
export function formatTime(isoString: string) {
	try {
		const date = new Date(isoString);
		return date.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		});
	} catch {
		return isoString;
	}
}

// Helper function to format ISO date strings
export function formatDate(isoString: string): string {
	try {
		const date = new Date(isoString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return isoString;
	}
}

// Helper function to format ISO date for chat divider
export function formatDateDivider(isoString: string): string {
	try {
		const date = new Date(isoString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).toUpperCase();
	} catch {
		return isoString;
	}
}

// Channel configuration helper
export function channelConf(channel: Channel) {
	switch (channel) {
		case "email":
			return { label: "EMAIL", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" };
		case "sms":
			return { label: "SMS", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" };
	}
}





// DATA RETRIEVAL HELPERS
// Get a client by ID
export function getClientById(id: string, clients: Client[] = mockClients): Client | undefined {
	return clients.find((client) => client.id === id);
}

// Get messages for a specific client by ID, sorted by timestamp
export function getMessagesByClientId(clientId: string, messages: Message[] = mockMessages): Message[] {
	return messages
		.filter((msg) => msg.clientId === clientId)
		.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// Get the latest message for a specific client by ID to preview
export function getLatestMessage(clientId: string, messages: Message[] = mockMessages): Message | undefined {
	const clientMsgs = getMessagesByClientId(clientId, messages);
	return clientMsgs.length > 0 ? clientMsgs[clientMsgs.length - 1] : undefined;
}

// Get the count of unread messages
export function getUnreadCount(clientId: string, messages: Message[] = mockMessages): number {
	return messages.filter((msg) => msg.clientId === clientId && msg.direction === "in" && msg.isRead === false).length;
}

// Get a preview of the latest message
export function getPreview(clientId: string, messages: Message[] = mockMessages): string {
	const latest = getLatestMessage(clientId, messages);
	if (!latest) return "";
	return latest.body.length > 45 ? `   ${latest.body.slice(0, 45) + "..."}` : `"  " ${latest.body}`;
}

// Check if a message can be replied to
export function canReply(message: Message): boolean {
	if (message.canReply !== undefined) {
		return message.canReply;
	}
	return message.direction === "in";
}

// Get the latest message timestamp
export function getLatestMessageTime(clientId: string, messages: Message[]): number {
	const clientMsgs = messages.filter((m) => m.clientId === clientId);
	if (clientMsgs.length === 0) return 0;

	return Math.max(...clientMsgs.map((m) => new Date(m.timestamp).getTime()));
}