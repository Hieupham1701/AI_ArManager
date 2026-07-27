import React from 'react'
import {
	ClientFormData,
	ClientFormErrors,
	REMINDER_CHANNELS,
	AI_TONES,
	ACCENT
} from '../../lib/clients/types'

export interface AddClientFormProps {
	form: ClientFormData
	errors?: ClientFormErrors
	serverError?: string | null
	isSubmitting?: boolean
	isEditMode?: boolean
	onChange: (updates: Partial<ClientFormData>) => void
	onSave: () => void
	onCancel: () => void
}

export function AddClientForm({
	form,
	errors = {},
	serverError,
	isSubmitting = false,
	isEditMode = false,
	onChange,
	onSave,
	onCancel
}: AddClientFormProps) {

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!isSubmitting) {
			onSave()
		}
	}

	const getInputStyle = (fieldName: keyof ClientFormData) => `
        w-full h-10 px-4 text-[12px] text-slate-700 bg-white border 
        ${errors[fieldName] ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:border-[#4b9cd3] focus:ring-sky-100'} 
        rounded-full placeholder-slate-400 focus:outline-none focus:ring-2 transition duration-150 disabled:bg-slate-50 disabled:text-slate-400
    `

	return (
		<form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col gap-5">
			{/* Header */}
			<div className="flex items-center justify-between pb-3 border-b border-slate-100">
				<div className="flex items-center gap-2">
					<h2 className="font-bold text-slate-800 text-[16px]">
						{isEditMode ? 'Edit Client' : 'Add New Client'}
					</h2>
					{isEditMode && (
						<span className="text-[11px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full">
							Editing Mode
						</span>
					)}
				</div>
				<span className="text-[12px] font-medium" style={{ color: ACCENT }}>* Required</span>
			</div>

			{/* Server Error Alert */}
			{serverError && (
				<div className="p-3 text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
					<svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{serverError}</span>
				</div>
			)}

			{/* Basic Information Section */}
			<div className="flex flex-col gap-3.5">
				<p className="text-[12px] font-semibold tracking-wider text-slate-400 uppercase">
					Basic Information
				</p>

				{/* Company Name */}
				<div>
					<label className="block text-[12px] font-medium text-slate-600 mb-1">
						Company Name <span style={{ color: ACCENT }}>*</span>
					</label>
					<input
						disabled={isSubmitting}
						className={getInputStyle('company')}
						placeholder="e.g. Acme Corporation"
						value={form.company}
						onChange={e => onChange({ company: e.target.value })}
					/>
					{errors.company && (
						<p className="text-red-500 text-[11px] mt-1 pl-3">{errors.company}</p>
					)}
				</div>

				{/* Contact Person */}
				<div>
					<label className="block text-[12px] font-medium text-slate-600 mb-1">
						Contact Person <span style={{ color: ACCENT }}>*</span>
					</label>
					<input
						disabled={isSubmitting}
						className={getInputStyle('contact')}
						placeholder="e.g. John Doe"
						value={form.contact}
						onChange={e => onChange({ contact: e.target.value })}
					/>
					{errors.contact && (
						<p className="text-red-500 text-[11px] mt-1 pl-3">{errors.contact}</p>
					)}
				</div>

				{/* Email & Phone Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div>
						<label className="block text-[12px] font-medium text-slate-600 mb-1">
							Email Address <span style={{ color: ACCENT }}>*</span>
						</label>
						<input
							type="email"
							disabled={isSubmitting}
							className={getInputStyle('email')}
							placeholder="johndoe@acme.com"
							value={form.email}
							onChange={e => onChange({ email: e.target.value })}
						/>
						{errors.email && (
							<p className="text-red-500 text-[11px] mt-1 pl-3">{errors.email}</p>
						)}
					</div>

					<div>
						<label className="block text-[12px] font-medium text-slate-600 mb-1">
							Phone Number <span style={{ color: ACCENT }}>*</span>
						</label>
						<input
							type="tel"
							disabled={isSubmitting}
							className={getInputStyle('phone')}
							placeholder="+1 (555) 000-0000"
							value={form.phone}
							onChange={e => onChange({ phone: e.target.value })}
						/>
						{errors.phone && (
							<p className="text-red-500 text-[11px] mt-1 pl-3">{errors.phone}</p>
						)}
					</div>
				</div>

				{/* Payment Terms */}
				<div>
					<label className="block text-[12px] font-medium text-slate-600 mb-1">
						Payment Terms <span style={{ color: ACCENT }}>*</span>
					</label>
					<input
						disabled={isSubmitting}
						className={getInputStyle('paymentTerms')}
						placeholder="e.g. Net 30, Net 15, Due on Receipt"
						value={form.paymentTerms}
						onChange={e => onChange({ paymentTerms: e.target.value })}
					/>
					{errors.paymentTerms && (
						<p className="text-red-500 text-[11px] mt-1 pl-3">{errors.paymentTerms}</p>
					)}
				</div>
			</div>

			{/* Preferred Channel Selection */}
			<div className="pt-2">
				<label className="block text-[12px] font-semibold text-slate-700 mb-2">
					Preferred Reminder Channel
				</label>
				<div className="flex flex-wrap gap-2.5">
					{REMINDER_CHANNELS.map(ch => {
						const isSelected = form.channel === ch.value
						return (
							<button
								key={ch.value}
								type="button"
								disabled={isSubmitting}
								onClick={() => onChange({ channel: ch.value })}
								className={`text-[12px] font-medium px-4 py-2 rounded-full border transition-all duration-150 disabled:opacity-50 ${isSelected
									? 'border-[#4b9cd3] bg-[#eaf4fb] text-[#1f6e9e] font-semibold shadow-sm'
									: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
									}`}
							>
								{ch.label}
							</button>
						)
					})}
				</div>
			</div>

			{/* AI Tone Selection */}
			<div className="pt-1">
				<label className="block text-[12px] font-semibold text-slate-700 mb-2">
					AI Collection Settings
				</label>
				<div className="flex flex-wrap gap-2.5">
					{AI_TONES.map(t => {
						const isSelected = form.tone === t.value
						return (
							<button
								key={t.value}
								type="button"
								disabled={isSubmitting}
								onClick={() => onChange({ tone: t.value })}
								className={`text-[12px] font-medium px-4 py-2 rounded-full border transition-all duration-150 disabled:opacity-50 ${isSelected
									? 'border-slate-800 bg-slate-800 text-white font-semibold shadow-sm'
									: 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
									}`}
							>
								{t.label}
							</button>
						)
					})}
				</div>
			</div>

			{/* Special Notes */}
			<div className="pt-1">
				<label className="block text-[12px] font-medium text-slate-600 mb-1">
					Special Notes (Optional)
				</label>
				<textarea
					rows={3}
					disabled={isSubmitting}
					className="w-full px-4 py-2.5 text-[12px] text-slate-700 bg-white border border-slate-200 rounded-2xl placeholder-slate-400 focus:outline-none focus:border-[#4b9cd3] focus:ring-2 focus:ring-sky-100 transition resize-none disabled:bg-slate-50 disabled:text-slate-400"
					placeholder="e.g. Prefers digital receipts. Late payment history in Q2."
					value={form.notes}
					onChange={e => onChange({ notes: e.target.value })}
				/>
			</div>

			{/* Actions */}
			<div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-1">
				<button
					type="button"
					disabled={isSubmitting}
					onClick={onCancel}
					className="flex-1 h-10 rounded-full border border-slate-200 bg-white text-slate-600 text-[12px] font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
				>
					{isEditMode ? 'Cancel Edit' : 'Reset'}
				</button>
				<button
					type="submit"
					disabled={isSubmitting}
					className="flex-1 h-10 rounded-full text-white text-[12px] font-semibold transition-opacity hover:opacity-90 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
					style={{ backgroundColor: ACCENT }}
				>
					{isSubmitting ? (
						<>
							<svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							{isEditMode ? 'Updating...' : 'Saving...'}
						</>
					) : (
						isEditMode ? 'Update Client' : 'Save Client'
					)}
				</button>
			</div>

		</form>
	)
}