// TYPES AND INTERFACES 

// union types 
export type Channel = "email" | "sms";
export type Direction = "in" | "out";
export type Intent = "dispute" | "promise_to_pay" | "invoice_request" | "other";
export type SenderType = "client" | "AI" | "human";
export type OutStatus = "sent" | "delivered" | "failed";

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
	intent?: Intent; // for incoming messages
	status?: OutStatus; 
  	isRead?: boolean;
	canReply?: boolean;
}