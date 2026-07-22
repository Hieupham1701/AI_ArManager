"use client";

import { useState, useEffect } from "react";
import { Mail, MessageSquare, Send, Sparkles, Paperclip, X, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { Message, Channel, Client, ACCENT } from "../../lib/communications/types";

interface MessageComposerProps {
	client?: Client;
	replyingTo?: Message | null;
	recipientEmail?: string;
	recipientPhone?: string;
	onCancelReply?: () => void;
	onSendMessage?: (data: { channel: Channel; subject?: string; body: string }) => void;
}

export function MessageComposer({
	client,
	replyingTo,
	recipientEmail,
	recipientPhone,
	onCancelReply,
	onSendMessage,
}: MessageComposerProps) {
	const [channel, setChannel] = useState<Channel>("email");
	const [subject, setSubject] = useState("");
	const [body, setBody] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);

	// auto-fill subject when replying to an email
	useEffect(() => {
		if (replyingTo) {
			setChannel(replyingTo.channel);
			if (replyingTo.channel === "email") {
				const replySubject = replyingTo.subject
					? replyingTo.subject.startsWith("Re:")
						? replyingTo.subject
						: `Re: ${replyingTo.subject}`
					: "Re: Follow up on account status";
				setSubject(replySubject);
			}
		}
	}, [replyingTo]);

	// AI Generate Reply Draft (Mocked for now, will integrate with Gemini API later)
	const handleGenerateAIDraft = async () => {
		setIsGenerating(true);

		// Mock AI Draft Generation Logic
		const recipientFirstName = replyingTo?.sender?.split(" ")[0] || client?.name?.split(" ")[0] || "there";
		const invoiceRef = client?.invoice ? `invoice ${client.invoice}` : "your invoice";

		// TODO: Integrate with Gemini API to generate AI draft based on context
		setTimeout(() => {
			if (channel === "sms") {
				// Short and concise draft for SMS channel
				if (replyingTo?.intent === "invoice_request") {
					setBody(
						`Hi ${recipientFirstName}, we've sent the requested statement for ${invoiceRef} to your email. Let us know if you need anything else!`
					);
				} else if (replyingTo?.intent === "dispute") {
					setBody(
						`Hi ${recipientFirstName}, thanks for reaching out. We are reviewing the details for ${invoiceRef} and will update you shortly.`
					);
				} else {
					setBody(
						`Hi ${recipientFirstName}, thank you for the update regarding ${invoiceRef}. We've noted this in our system.`
					);
				}
			} else {
				// Formal draft for Email channel
				if (replyingTo?.intent === "invoice_request") {
					setBody(
						`Hi ${recipientFirstName},\n\nAttached is the requested statement for ${invoiceRef}. Please let us know if you need any further information to process payment.\n\nBest regards,\nAccounts Receivable Team`
					);
				} else if (replyingTo?.intent === "dispute") {
					setBody(
						`Hi ${recipientFirstName},\n\nThank you for bringing this to our attention regarding ${invoiceRef}. We are reviewing the line items with our team and will follow up shortly.\n\nBest regards,\nAccounts Receivable Team`
					);
				} else {
					setBody(
						`Hi ${recipientFirstName},\n\nThank you for the update regarding ${invoiceRef}. We have recorded your notes in our system.\n\nBest regards,\nAccounts Receivable Team`
					);
				}
			}
			setIsGenerating(false);
		}, 600);
	};

	// mock tone violation detection
	const isToneFlagged = body.toLowerCase().includes("pay now or else") ||
		body.toLowerCase().includes("legal action immediately") ||
		body.toLowerCase().includes("threat");

	const handleSend = (e: React.FormEvent) => {
		e.preventDefault();
		if (!body.trim() || isToneFlagged) return;

		onSendMessage?.({
			channel,
			subject: channel === "email" ? subject : undefined,
			body,
		});

		setBody("");
		if (!replyingTo) setSubject("");
	};

	// Determine recipient contact based on channel and client info
	const recipientContact = channel === "email"
		? (client?.email || recipientEmail)
		: (client?.phone || recipientPhone);

	return (
		<div className="bg-white border-t border-slate-200 p-4 space-y-3 shrink-0">
			{/* Banner Replying */}
			{replyingTo && (
				<div className="flex items-center justify-between bg-sky-50/80 border border-sky-200/80 rounded-xl px-3 py-2 text-[12px] text-slate-700">
					<div className="flex items-center gap-2 truncate">
						<span className="font-semibold text-sky-700 shrink-0">
							Replying to {replyingTo.sender}:
						</span>
						<span className="truncate italic text-slate-500">"{replyingTo.body}"</span>
					</div>
					<button
						type="button"
						onClick={onCancelReply}
						className="p-1 hover:bg-sky-100 rounded-full text-slate-400 hover:text-slate-600 transition shrink-0"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				</div>
			)}

			<form onSubmit={handleSend} className="space-y-3">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3">
						{/* Email/sms Toggle */}
						<div className="flex items-center bg-slate-100 p-1 rounded-full text-[12px]">
							<button
								type="button"
								onClick={() => setChannel("email")}
								className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition ${channel === "email"
									? "bg-sky-100 text-sky-700 font-semibold shadow-xs"
									: "text-slate-500 hover:text-slate-800"
									}`}
							>
								<Mail className="w-3.5 h-3.5" />
								<span>Email</span>
							</button>
							<button
								type="button"
								onClick={() => setChannel("sms")}
								className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition ${channel === "sms"
									? "bg-purple-100 text-purple-700 font-semibold shadow-xs"
									: "text-slate-500 hover:text-slate-800"
									}`}
							>
								<MessageSquare className="w-3.5 h-3.5" />
								<span>SMS</span>
							</button>
						</div>

						{/* Recipient Contact */}
						{recipientContact && (
							<span className="text-[12px] text-slate-400">
								Sending to: <span className="font-semibold text-slate-700">{recipientContact}</span>
							</span>
						)}
					</div>

					{/* AI Draft Button */}
					<button
						type="button"
						onClick={handleGenerateAIDraft}
						disabled={isGenerating}
						style={{ backgroundColor: ACCENT }}
						className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-medium text-white rounded-full transition shadow-xs hover:opacity-90 disabled:opacity-50 shrink-0"
					>
						<Sparkles className="w-4 h-4 text-white" />
						<span>{isGenerating ? "Drafting..." : "AI Draft"}</span>
					</button>
				</div>

				{/* Subject Input - only for Email */}
				{channel === "email" && (
					<input
						type="text"
						placeholder="Subject line..."
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						className="w-full px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white transition"
					/>
				)}

				{/* Textarea */}
				<div className="relative">
					<textarea
						rows={3}
						placeholder={
							channel === "email"
								? "Type your message or click 'AI Draft' to generate..."
								: "Type an SMS message..."
						}
						value={body}
						onChange={(e) => setBody(e.target.value)}
						className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white resize-none transition"
					/>
				</div>

				{/* Attachment & Send Button */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<button
							type="button"
							className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
							title="Attach file"
						>
							<Paperclip className="w-4 h-4" />
						</button>

						{/* Dynamic Gemini Verification Status */}
						{isGenerating ? (
							<div className="flex items-center gap-1.5 text-[11px] text-amber-600 animate-pulse">
								<Loader2 className="w-3.5 h-3.5 animate-spin" />
								<span>Verifying compliance with Gemini...</span>
							</div>
						) : isToneFlagged ? (
							/* Trạng thái 1: Flagged / Cảnh báo Tone không đạt */
							<div className="flex items-center gap-1.5 text-[11px]">
								<AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
								<span className="font-semibold text-rose-600">
									Gemini Flagged: Non-Compliant Tone
								</span>
								<span className="text-slate-400 font-normal">
									- please revise before sending
								</span>
							</div>
						) : body.trim() ? (
							/* Trạng thái 2: Verified / Tone đạt chuẩn */
							<div className="flex items-center gap-1.5 text-[11px]">
								<ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
								<span className="font-semibold text-emerald-700">
									Gemini Tone & Compliance Verified
								</span>
								<span className="text-slate-400 font-normal">
									- ready to send
								</span>
							</div>
						) : null}
					</div>

					<button
						type="submit"
						disabled={!body.trim() || isToneFlagged}
						style={body.trim() && !isToneFlagged ? { backgroundColor: ACCENT } : undefined}
						className="flex items-center gap-2 px-5 py-1.5 text-[12px] font-semibold disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-full transition hover:opacity-90 shadow-xs"
					>
						<span>Send Message</span>
						<Send className="w-4 h-4" />
					</button>
				</div>
			</form>
		</div>
	);
}