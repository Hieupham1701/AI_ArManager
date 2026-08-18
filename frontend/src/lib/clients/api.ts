import { apiRequest, withAuth } from '../auth/api'
import { getSession } from '../auth/session'
import { Client, ClientFormData } from './types'

function accessToken(): string {
	const token = getSession()?.access_token
	if (!token) throw new Error('Your session has expired. Please log in again.')
	return token
}

export function listClients() {
	return apiRequest<Client[]>('/clients', {
		headers: withAuth(accessToken()),
	})
}

export function createClient(payload: ClientFormData) {
	return apiRequest<Client>('/clients', {
		method: 'POST',
		headers: withAuth(accessToken()),
		body: JSON.stringify(payload),
	})
}

export function updateClient(id: string | number, payload: ClientFormData) {
	return apiRequest<Client>(`/clients/${encodeURIComponent(String(id))}`, {
		method: 'PATCH',
		headers: withAuth(accessToken()),
		body: JSON.stringify(payload),
	})
}

export function deleteClient(id: string | number) {
	return apiRequest<void>(`/clients/${encodeURIComponent(String(id))}`, {
		method: 'DELETE',
		headers: withAuth(accessToken()),
	})
}
