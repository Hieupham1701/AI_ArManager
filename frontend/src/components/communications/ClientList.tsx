"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { ACCENT, Client, Message } from "../../lib/communications/types";
import { getUnreadCount, getPreview, overdueConf, formatCurrency, getLatestMessageTime } from "../../lib/communications/helpers";


interface ClientListProps {
	clients: Client[];
	messages: Message[];
	selectedClientId: string;
	onSelectClient: (id: string) => void;
}

export function ClientList({ clients, messages, selectedClientId, onSelectClient }: ClientListProps) {
	const [searchTerm, setSearchTerm] = useState("");

	const filteredClients = clients.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.invoice.toLowerCase().includes(searchTerm.toLowerCase()));

	const sortedClients = [...filteredClients].sort((a, b) => getLatestMessageTime(b.id, messages) - getLatestMessageTime(a.id, messages));

	return (
		<div className="w-80 border-r border-slate-200 bg-white flex flex-col h-full shrink-0">
			{/* HEADER */}
			<div className="p-3.5 border-b border-slate-100 space-y-3">
				<h2 className="text-[16px] font-bold text-slate-800 tracking-wider">
					ACTIVE CONVERSATIONS ({sortedClients.length})
				</h2>

				{/* SEARCH BAR */}
				<div className="relative">
					<Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<input
						type="text"
						placeholder="Search client or invoice..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-300 transition placeholder:text-slate-400"
					/>
				</div>
			</div>

			{/* CLIENT LIST */}
			<div className="flex-1 overflow-y-auto p-2 space-y-1">
				{sortedClients.map((client) => {
					const isSelected = client.id === selectedClientId;
					const unreadCount = getUnreadCount(client.id, messages);
					const preview = getPreview(client.id, messages);
					const overdue = overdueConf(client.daysOverdue);

					return (
						<button
							key={client.id}
							onClick={() => onSelectClient(client.id)}
							className={`w-full p-2.5 text-left transition rounded-md flex flex-col gap-1 border ${isSelected ? "bg-slate-50/80 border-slate-200 border-l-4" : "bg-white border-transparent hover:bg-slate-50/80"}`}
							style={isSelected ? { borderLeftColor: ACCENT } : undefined}
						>
							<div className="flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 min-w-0">
									{/* Status Read, Unread */}
									<span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: isSelected || unreadCount > 0 ? ACCENT : "#cbd5e1" }} />
									<h4
										className={`text-[12px] truncate ${isSelected ? "font-bold" : unreadCount > 0
											? "font-bold text-slate-900"
											: "font-semibold text-slate-800"}`}
										style={isSelected ? { color: ACCENT } : undefined}
									>
										{client.name}
									</h4>
								</div>

								{/* Top Right Unread Badge */}
								{unreadCount > 0 && (
									<span
										className="w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white rounded-full shadow-sm shrink-0"
										style={{ backgroundColor: ACCENT }}
									>
										{unreadCount}
									</span>
								)}
							</div>

							{/* Invoice & Amount */}
							<div className="text-[12px] text-slate-400 pl-4 flex items-center gap-2.5">
								<span>{client.invoice}</span>
								<span className="text-slate-300 font-light">|</span>
								<span className="font-semibold text-slate-700">
									{formatCurrency(client.amount)}
								</span>
							</div>

							<div className="flex items-center gap-2 pl-4 mt-0.5 min-w-0">
								{/* Overdue Badge */}
								<span
									className="text-[10px] px-2 py-0.5 rounded-full font-medium border shrink-0"
									style={{
										backgroundColor: overdue.bg,
										color: overdue.text,
										borderColor: overdue.border,
									}}
								>
									{overdue.label}
								</span>

								{/* Message Preview */}
								<span className="text-[12px] text-slate-400 italic truncate min-w-0">
									{preview ? preview : "No messages..."}
								</span>
							</div>
						</button>
					);
				})}

				{sortedClients.length === 0 && (
					<div className="p-6 text-center text-[12px] text-slate-400">
						No clients found...
					</div>
				)}
			</div>
		</div>
	);
}