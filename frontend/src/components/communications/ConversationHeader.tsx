"use client";

import { Mail, Phone, FileText, MoreHorizontal } from "lucide-react";
import { Client, ACCENT } from "../../lib/communications/types";
import { overdueConf, formatCurrency } from "../../lib/communications/helpers";

interface ConversationHeaderProps {
	client?: Client;
}

export function ConversationHeader({ client }: ConversationHeaderProps) {
	if (!client) {
		return (
			<div className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
				<span className="text-[14px] text-slate-400 italic">No client selected</span>
			</div>
		);
	}

	const overdue = overdueConf(client.daysOverdue);

	// Days Overdue
	const headerOverdueLabel = client.daysOverdue === 0 ? "Current" : `${client.daysOverdue} Days Overdue`;

	return (
		<div className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
			<div className="flex items-center gap-3.5 min-w-0">
				{/* Client Avatar */}
				<div
					className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0 bg-sky-50 border border-sky-100"
					style={{ color: ACCENT }}
				>
					{client.initials}
				</div>

				{/* Client Details */}
				<div className="space-y-1 min-w-0">
					<div className="flex items-center gap-2.5 min-w-0">
						<h1 className="text-[16px] font-bold text-slate-900 truncate">{client.name}</h1>
						{overdue && (
							<span
								className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold border shrink-0"
								style={{
									backgroundColor: overdue.bg,
									color: overdue.text,
									borderColor: overdue.border,
								}}
							>
								{headerOverdueLabel}
							</span>
						)}
					</div>

					<div className="flex items-center gap-2 text-[12px] flex-wrap">
						<span className="flex items-center gap-1 text-sky-700">
							<FileText className="w-3.5 h-3.5 text-sky-500" />
							<span className="font-semibold">{client.invoice}</span>
						</span>
						<span className="text-slate-300">•</span>
						<span className="text-sky-700">
							<span className="text-sky-500">Amount: </span>
							<span className="font-semibold">{formatCurrency(client.amount)}</span>
						</span>
						<span className="text-slate-300">•</span>
						<span className="flex items-center gap-1 text-sky-700">
							<Mail className="w-3.5 h-3.5 text-sky-500" />
							<span className="font-medium">{client.email}</span>
						</span>
						<span className="text-slate-300">•</span>
						<span className="flex items-center gap-1 text-sky-700">
							<Phone className="w-3.5 h-3.5 text-sky-500" />
							<span className="font-medium">{client.phone}</span>
						</span>
					</div>
				</div>
			</div>

			{/* More Options Button */}
			<div className="flex items-center gap-2 shrink-0">
				<button
					type="button"
					className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
					title="More options"
				>
					<MoreHorizontal className="w-5 h-5" />
				</button>
			</div>
		</div>
	);
}