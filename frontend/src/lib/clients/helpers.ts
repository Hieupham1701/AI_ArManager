import {
	Client,
	ClientFormData,
	ClientFormErrors,
	ClientFilterState,
	ReminderChannel,
	AITone,
	REMINDER_CHANNELS,
	AI_TONES
} from './types'

// Helper functions for client management
export const getCompanyInitial = (companyName?: string): string => {
	const trimmed = companyName?.trim()
	return trimmed && trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : 'C'
}

// get the label and badge class for a given reminder channel
export const getChannelMeta = (channel: ReminderChannel) => {
	return (
		REMINDER_CHANNELS.find(c => c.value === channel) || {
			value: channel,
			label: channel,
			badgeLabel: `Client prefers ${channel}`,
			badgeClass: 'bg-slate-50 text-slate-700 border-slate-200'
		}
	)
}

// get the label and color for a given AI tone
export const getToneMeta = (tone: AITone) => {
	return (
		AI_TONES.find(t => t.value === tone) || {
			value: tone,
			label: tone,
			textColor: 'text-slate-600',
			color: 'border-slate-200 bg-slate-50',
			promptHint: '',
		}
	)
}

// 
export const getToneTextColor = (tone: AITone): string => {
	return getToneMeta(tone).textColor
}

// get the prompt hint 
export const getAIPromptHint = (tone: AITone): string => {
	return getToneMeta(tone).promptHint
}

// format a date string
export const formatClientDate = (dateString?: string): string => {
	if (!dateString) return 'N/A'
	try {
		const date = new Date(dateString)
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		}).format(date)
	} catch {
		return 'Invalid Date'
	}
}

export const sanitizeFormData = (data: ClientFormData): ClientFormData => {
	return {
		...data,
		company: data.company.trim(),
		contact: data.contact.trim(),
		email: data.email.trim().toLowerCase(),
		phone: data.phone.trim(),
		paymentTerms: data.paymentTerms.trim(),
		notes: data.notes.trim(),
	}
}

// Validate client form data
export const validateClientForm = (data: ClientFormData): ClientFormErrors => {
	const errors: ClientFormErrors = {}

	if (!data.company.trim()) {
		errors.company = 'Company name is required'
	}

	if (!data.contact.trim()) {
		errors.contact = 'Contact person is required'
	}

	if (!data.email.trim()) {
		errors.email = 'Email address is required'
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
		errors.email = 'Invalid email address format'
	}

	const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/
	const digitsOnly = data.phone.trim().replace(/\D/g, '')

	if (!data.phone.trim()) {
		errors.phone = 'Phone number is required'
	} else if (!phoneRegex.test(data.phone.trim()) || digitsOnly.length < 7) {
		errors.phone = 'Invalid phone number format'
	}

	if (!data.paymentTerms.trim()) {
		errors.paymentTerms = 'Payment terms are required'
	}

	return errors
}

// Filter clients
export const filterClients = (
	clients: Client[],
	filters: ClientFilterState
): Client[] => {
	return clients.filter(client => {
		const query = filters.searchQuery.toLowerCase().trim()
		const matchesSearch =
			!query ||
			client.company.toLowerCase().includes(query) ||
			client.contact.toLowerCase().includes(query) ||
			client.email.toLowerCase().includes(query)

		const matchesChannel =
			!filters.channel || filters.channel === 'all' || client.channel === filters.channel

		const matchesTone =
			!filters.tone || filters.tone === 'all' || client.tone === filters.tone

		const matchesStatus =
			!filters.status || filters.status === 'all' || (client.status || 'active') === filters.status

		return matchesSearch && matchesChannel && matchesTone && matchesStatus
	})
}