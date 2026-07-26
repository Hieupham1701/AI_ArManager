// TYPES AND INTERFACES 

export const ACCENT = "#4b9cd3"; // carolina-500

// union types 
export type Channel = "email" | "sms";
export type Direction = "in" | "out";
export type Intent = "dispute" | "promise_to_pay" | "invoice_request" | "other";
export type SenderType = "client" | "AI" | "human";
export type OutStatus = "sent" | "delivered" | "failed";
export type ComplianceState = "idle" | "verifying" | "verified" | "flagged";


// interface types 
export interface Client {
	id: string;
	name: string;
	email: string;
	phone: string;
	initials: string;
	invoice: string;
	amount: number;
	daysOverdue: number;
}

export interface Message {
	id: string;
	clientId: string;
	direction: Direction;
	channel: Channel;
	timestamp: string;
	sender: string;
	senderType: SenderType;
	senderInitials: string;
	senderLabel: string;
	subject?: string;
	body: string;
	intent?: Intent;
	status?: OutStatus;
	isRead?: boolean;
	canReply?: boolean;
	complianceStatus?: ComplianceState;
}