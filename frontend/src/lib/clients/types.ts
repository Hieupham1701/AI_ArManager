export const ACCENT = "#4b9cd3"

// Reminder Channels configuration
export const REMINDER_CHANNELS = [
	{
		value: 'email',
		label: 'Email',
		badgeLabel: 'Client prefers email',
		badgeClass: 'bg-sky-50 text-sky-700 border-sky-200'
	},
	{
		value: 'sms',
		label: 'SMS',
		badgeLabel: 'Client prefers SMS',
		badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
	},
	{
		value: 'phone',
		label: 'Phone Call',
		badgeLabel: 'Client prefers phone',
		badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
	},
] as const

// AI Tones configuration
export const AI_TONES = [
	{
		value: 'friendly',
		label: 'Friendly',
		textColor: 'text-emerald-600',
		color: 'border-emerald-200 bg-emerald-50',
		promptHint: 'Use warm, polite, empathetic, and casual business language.'
	},
	{
		value: 'professional',
		label: 'Professional',
		textColor: 'text-[#4b9cd3]',
		color: 'border-blue-200 bg-blue-50',
		promptHint: 'Maintain a formal, clear, objective, and business-oriented tone.'
	},
	{
		value: 'firm',
		label: 'Firm',
		textColor: 'text-orange-600',
		color: 'border-orange-200 bg-orange-50',
		promptHint: 'Be direct, assert payment deadlines clearly, and emphasize urgency without being disrespectful.'
	},
] as const

// Union types
export type ReminderChannel = (typeof REMINDER_CHANNELS)[number]['value']
export type AITone = (typeof AI_TONES)[number]['value']
export type ClientStatus = 'active' | 'archived'

export interface Client {
	id: string | number
	company: string
	contact: string
	email: string
	phone: string
	channel: ReminderChannel
	tone: AITone
	paymentTerms: string
	notes?: string
	status?: ClientStatus
	createdAt?: string
	updatedAt?: string
}

export interface ClientFormData {
	company: string
	contact: string
	email: string
	phone: string
	paymentTerms: string
	channel: ReminderChannel
	tone: AITone
	notes: string
}

// Helper functions for client data
export const DEFAULT_FORM_DATA: ClientFormData = {
	company: '',
	contact: '',
	email: '',
	phone: '',
	paymentTerms: '',
	channel: 'email',
	tone: 'friendly',
	notes: '',
}

export type ClientFormErrors = Partial<Record<keyof ClientFormData, string>>

export interface ClientFilterState {
	searchQuery: string
	channel?: ReminderChannel | 'all'
	tone?: AITone | 'all'
	status?: ClientStatus | 'all'
}

// Payload types for API requests
export type CreateClientInput = ClientFormData
export type UpdateClientInput = Partial<ClientFormData>

// AI Prompt Generation Payload Schema
export interface AIReminderPayload {
	clientId: string
	company: string
	contact: string
	channel: ReminderChannel
	tone: AITone
	promptHint: string
	overdueDays?: number
	amountDue?: number
}