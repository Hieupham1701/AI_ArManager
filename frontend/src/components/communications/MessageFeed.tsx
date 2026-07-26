"use client";

import { useRef, useEffect } from "react";
import { Message } from "../../lib/communications/types";
import { MessageCard } from "./MessageCard";


interface MessageFeedProps {
	messages: Message[];
	onReply: (message: Message) => void;
}

export function MessageFeed({ messages, onReply }: MessageFeedProps) {
	const feedEndRef = useRef<HTMLDivElement>(null);

	// Find the index of the latest inbound message
	const lastInboundIndex = messages.findLastIndex((m) => m.direction === "in");

	// Helper to check if two timestamps are on the same calendar day
	const isSameDay = (dateStr1: string, dateStr2: string) => {
		const d1 = new Date(dateStr1);
		const d2 = new Date(dateStr2);
		return (
			d1.getFullYear() === d2.getFullYear() &&
			d1.getMonth() === d2.getMonth() &&
			d1.getDate() === d2.getDate()
		);
	};

	// Auto-scroll to the bottom whenever messages change
	useEffect(() => {
		feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	if (messages.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center text-[12px] text-slate-400 italic">
				No messages found for this client.
			</div>
		);
	}

	return (
		<div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-2">
			{messages.map((msg, index) => {
				const prevMsg = messages[index - 1];
				const showDivider = !prevMsg || !isSameDay(msg.timestamp, prevMsg.timestamp);

				return (
					<MessageCard
						key={msg.id}
						message={msg}
						showDateDivider={showDivider}
						canReply={index === lastInboundIndex}
						onReply={onReply}
					/>
				);
			})}
			<div ref={feedEndRef} />
		</div>
	);
}