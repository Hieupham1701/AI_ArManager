"use client";

import { Mail, MessageSquare, Check, CheckCheck, AlertTriangle } from "lucide-react";
import { Message } from "../../lib/communications/types";
import { formatTime, formatDateDivider, intentConf, channelConf } from "../../lib/communications/helpers";

interface MessageCardProps {
	message: Message;
	showDateDivider?: boolean;
	dateLabel?: string;
	canReply?: boolean;
	onReply?: (message: Message) => void;
}

export function MessageCard({ message, showDateDivider = true, dateLabel, canReply = false, onReply }: MessageCardProps) {
	const isInbound = message.direction === "in";
	const intentInfo = intentConf(message.intent);
	const channelInfo = channelConf(message.channel);

	return (
		<div className="w-full flex flex-col">
			{/* Date Divider */}
			{showDateDivider && (
				<div className="flex items-center justify-center my-6 w-full">
					<div className="flex-1 border-t border-slate-200" />
					<span className="px-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
						{dateLabel || formatDateDivider(message.timestamp)}
					</span>
					<div className="flex-1 border-t border-slate-200" />
				</div>
			)}

			<div className={`flex flex-col gap-1.5 my-2 ${isInbound ? "items-start" : "items-end"}`}>
				{/* Sender Info */}
				<div className="flex items-center gap-2 text-[12px] text-slate-500 px-1">
					<div
						className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${message.senderType === "AI"
							? "bg-sky-100 text-sky-600"
							: isInbound
								? "bg-purple-100 text-purple-600"
								: "bg-slate-200 text-slate-700"
							}`}
					>
						{message.senderInitials || (message.senderType === "AI" ? "AI" : "U")}
					</div>

					<span className="font-semibold text-slate-800">{message.sender}</span>
					<span className="text-slate-300">•</span>
					<span className="text-[12px] text-slate-400">{message.senderLabel}</span>
					<span className="text-slate-300">•</span>
					<span className="text-[12px] text-slate-400">{formatTime(message.timestamp)}</span>
				</div>

				{/* Main Message Card Bubble */}
				<div
					className={`max-w-[85%] rounded-2xl p-4 border text-[12px] leading-relaxed space-y-2 shadow-sm ${isInbound
						? "bg-white border-slate-200 text-slate-800 rounded-tl-none"
						: "bg-sky-50/70 border-sky-200/80 text-slate-800 rounded-tr-none"
						}`}
				>
					{/* Channel & Intent Badge */}
					<div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-2">
						<div
							className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full font-semibold border uppercase tracking-wider ${channelInfo.bg} ${channelInfo.text} ${channelInfo.border}`}
						>
							{message.channel === "email" ? (
								<Mail className="w-3 h-3" />
							) : (
								<MessageSquare className="w-3 h-3" />
							)}
							<span>{channelInfo.label}</span>
						</div>

						{/* Intent Badge */}
						{intentInfo && (
							<span
								className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${intentInfo.bg} ${intentInfo.text} ${intentInfo.border}`}
							>
								{intentInfo.label}
							</span>
						)}
					</div>

					{/* Email Subject */}
					{message.subject && (
						<div className="font-semibold text-[12px] text-slate-900">
							{message.subject}
						</div>
					)}

					{/* Body Content */}
					<div className="whitespace-pre-line text-slate-600 text-[12px]">
						{message.body}
					</div>

					{/* Reply Button for Inbound Messages */}
					{isInbound && canReply && (
						<div className="flex justify-end pt-2 border-t border-slate-100">
							<button
								type="button"
								onClick={() => onReply?.(message)}
								className="px-3.5 py-1 text-[12px] font-semibold bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-full transition shadow-xs"
							>
								Reply
							</button>
						</div>
					)}

					{/* Outbound Delivery Status */}
					{!isInbound && message.status && (
						<div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
							{message.status === "delivered" && (
								<>
									<CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
									<span>Delivered</span>
								</>
							)}
							{message.status === "sent" && (
								<>
									<Check className="w-3.5 h-3.5 text-slate-400" />
									<span>Sent</span>
								</>
							)}
							{message.status === "failed" && (
								<>
									<AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
									<span className="text-rose-500">Failed to deliver</span>
								</>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}