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
			return { label: "Dispute", bg: "#fef3c7", text: "#df702b"};
		case "promise_to_pay":
			return { label: "Promise to Pay", bg: "#dcfce7", text: "#22c55e" };
		case "invoice_request":
			return { label: "Invoice Request", bg: "#c2e1f6", text: "#075985"};
		case "other":
		default:
			return { label: "General Query", bg: "#9ca3af", text: "#374151"};
	}
}


// Overdue Days configuration helper
export function overdueCfg(days: number) {
	if (days === 0) {
		return {label: "Current", bg: "#ecfdf5", text: "#05964d", border: "#ecfdf5",};
	}
	if (days <= 7) {
		return {
		label: `${days}d overdue`, bg: "#fffef9cb", text: "#717171",
		border: "#fffef9cb",
		};
	}
	if (days <= 30) {
		return {
		label: `${days}d overdue`, bg: "#f9cd96", text: "#ea580c", border: "#f9cd96",
		};
	}
	return {
		label: `${days}d overdue`, bg: "#f4a7a7", text: "#dc2626",
		border: "#f4a7a7",
	};
}

// Helper function to format numbers as USD currency ($)
export function fmt(n: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	}).format(n);
}

// Helper function to format ISO timestamp strings
export function formatTime(isoString: string) {
	const date = new Date(isoString);
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
}

// Helper function to format ISO date strings
export function formatDate(isoString: string): string {
	const date = new Date(isoString);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

// Channel configuration helper
export function channelConf(channel: Channel) {
	switch (channel) {
		case "email":
			return {label: "Email", iconName: "Mail", badgeBg: "#dfc5f9", badgeText: "#7d2eb3"};
		case "sms":
			return {label: "SMS", iconName: "MessageSquare", badgeBg: "#e0f2fe", badgeText: "#0369a1"};
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
	return latest.body.length > 45 ? latest.body.slice(0,45) + "..." : latest.body;
}

// Check if a message can be replied to
export function canReply(message: Message): boolean {
    if (message.canReply !== undefined){
    	return message.canReply;
  	}
  	return message.direction === "in";
}