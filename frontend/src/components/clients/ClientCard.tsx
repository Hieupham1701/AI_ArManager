import React from 'react'
import { Client, ACCENT } from '../../lib/clients/types'
import {
	getChannelMeta,
	getToneMeta,
	getToneTextColor,
	getCompanyInitial,
	formatClientDate
} from '../../lib/clients/helpers'


export interface ClientCardProps {
	client: Client
	onEdit?: (client: Client) => void
	onDelete: (id: string | number) => void
	onAddInvoice?: (client: Client) => void
}

export function ClientCard({ client, onEdit, onDelete, onAddInvoice }: ClientCardProps) {
	const channelMeta = getChannelMeta(client.channel)
	const toneMeta = getToneMeta(client.tone)
	const toneTextColor = getToneTextColor(client.tone)

	return (
		<div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-3.5 hover:shadow-md transition-shadow duration-200">

			<div className="flex items-start justify-between gap-3">
				<div className="flex items-center gap-3 min-w-0">
					<div
						className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[16px]"
						style={{ backgroundColor: `${ACCENT}1A`, color: ACCENT }}
					>
						{getCompanyInitial(client.company)}
					</div>

					{/* Company Name */}
					<div className="min-w-0">
						<h3 className="font-bold text-slate-800 text-[16px] leading-snug truncate">
							{client.company}
						</h3>
					</div>
				</div>

				{/* Channel & Tone */}
				<div className="flex flex-col items-end gap-1">
					<span className={`text-[12px] font-medium px-3.5 py-1 rounded-full whitespace-nowrap border ${channelMeta.badgeClass}`}>
						{channelMeta.badgeLabel}
					</span>
					<span className={`text-[12px] font-semibold pr-3 ${toneTextColor}`}>
						• {toneMeta.label}
					</span>
				</div>
			</div>


			{/* Contact Info */}
			<div className="flex flex-col gap-2 text-[12px] text-slate-600 pl-1">
				<div className="flex items-center gap-2">
					<svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
					</svg>
					<span className="font-medium text-slate-700">{client.contact}</span>
				</div>

				<div className="flex items-center gap-6 min-w-0">
					<div className="flex items-center gap-2 min-w-0">
						<svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						<span className="truncate">{client.email}</span>
					</div>

					<div className="flex items-center gap-2 flex-shrink-0">
						<svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
						</svg>
						<span>{client.phone}</span>
					</div>
				</div>

				{/* Payment Terms */}
				{client.paymentTerms && (
					<div className="text-[12px] text-slate-500 pt-0.5">
						Payment Terms: <strong className="font-semibold text-slate-700">{client.paymentTerms}</strong>
					</div>
				)}
			</div>

			{/* Notes */}
			{client.notes && (
				<div className="border-l-2 border-amber-400 bg-amber-50/30 pl-3 py-1.5 rounded-r-lg text-[12px] text-slate-600 italic">
					Note: {client.notes}
				</div>
			)}


			<div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-0.5">
				<span className="text-[12px] text-slate-400">
					{client.createdAt ? `Added ${formatClientDate(client.createdAt)}` : ''}
				</span>

				<div className="flex items-center gap-2">
					<button
						onClick={() => onAddInvoice?.(client)}
						className="flex items-center gap-1.5 text-white text-[12px] font-semibold px-4 py-2 rounded-full transition-opacity hover:opacity-90 shadow-sm"
						style={{ backgroundColor: ACCENT }}
					>
						<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
						</svg>
						Add Invoice
					</button>

					{onEdit && (
						<button
							onClick={() => onEdit(client)}
							className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 transition-colors"
							title="Edit Client"
						>
							<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
							</svg>
						</button>
					)}

					<button
						onClick={() => onDelete(client.id)}
						className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors"
						title="Delete Client"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
						</svg>
					</button>
				</div>
			</div>

		</div>
	)
}