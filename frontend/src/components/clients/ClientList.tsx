import React from 'react'
import { Client, ClientFilterState, REMINDER_CHANNELS, AI_TONES } from '../../lib/clients/types'
import { ClientCard } from './ClientCard'

export interface ClientListProps {
	clients: Client[]
	filters: ClientFilterState
	isLoading?: boolean
	onFilterChange: (updates: Partial<ClientFilterState>) => void
	onEditClient?: (client: Client) => void
	onDeleteClient: (id: string | number) => void
	onAddInvoice?: (client: Client) => void
}

export function ClientList({
	clients,
	filters,
	isLoading = false,
	onFilterChange,
	onEditClient,
	onDeleteClient,
	onAddInvoice
}: ClientListProps) {
	return (
		<div className="flex flex-col gap-4">
			<div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">

				<div className="relative w-full sm:w-72">
					<svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					<input
						type="text"
						placeholder="Search company, contact..."
						value={filters.searchQuery}
						onChange={e => onFilterChange({ searchQuery: e.target.value })}
						className="w-full h-9 pl-9 pr-4 text-[12px] bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:border-[#4b9cd3] focus:bg-white transition"
					/>
				</div>

				<div className="flex items-center gap-2 w-full sm:w-auto justify-end">
					<select
						value={filters.channel || 'all'}
						onChange={e => onFilterChange({ channel: e.target.value as any })}
						className="h-9 px-3 text-[12px] bg-slate-50 border border-slate-200 rounded-full text-slate-600 focus:outline-none focus:border-[#4b9cd3]"
					>
						<option value="all">All Channels</option>
						{REMINDER_CHANNELS.map(ch => (
							<option key={ch.value} value={ch.value}>{ch.label}</option>
						))}
					</select>

					<select
						value={filters.tone || 'all'}
						onChange={e => onFilterChange({ tone: e.target.value as any })}
						className="h-9 px-3 text-[12px] bg-slate-50 border border-slate-200 rounded-full text-slate-600 focus:outline-none focus:border-[#4b9cd3]"
					>
						<option value="all">All Tones</option>
						{AI_TONES.map(t => (
							<option key={t.value} value={t.value}>{t.label}</option>
						))}
					</select>
				</div>
			</div>

			{isLoading ? (
				<div className="flex flex-col gap-3">
					{[1, 2, 3].map(n => (
						<div key={n} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse p-4" />
					))}
				</div>
			) : clients.length > 0 ? (
				<div className="flex flex-col gap-3">
					{clients.map(client => (
						<ClientCard
							key={client.id}
							client={client}
							onEdit={onEditClient}
							onDelete={onDeleteClient}
							onAddInvoice={onAddInvoice}
						/>
					))}
				</div>
			) : (
				<div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center gap-2">
					<div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
						<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
					<h3 className="font-semibold text-slate-700 text-[14px]">No clients found</h3>
					<p className="text-slate-400 text-[12px]">Try adjusting your search or filter parameters</p>
				</div>
			)}
		</div>
	)
}