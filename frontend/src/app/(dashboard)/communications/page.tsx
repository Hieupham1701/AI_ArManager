"use client";

import { useState } from "react";
import { ClientList } from "../../../components/communications/ClientList";
import { ConversationHeader } from "../../../components/communications/ConversationHeader";
import { MessageFeed } from "../../../components/communications/MessageFeed";
import { MessageComposer } from "../../../components/communications/Composer";
import { mockClients, mockMessages as initialMessages } from "../../../lib/communications/mockData";
import { Message, Channel } from "../../../lib/communications/types";

export default function CommunicationsPage() {
  // STATE MANAGEMENT
  const [clients] = useState(mockClients);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedClientId, setSelectedClientId] = useState<string>(mockClients[0].id);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  // Get current active client object
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Get active client messages sorted by timestamp
  const activeMessages = messages
    .filter((m) => m.clientId === selectedClientId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // SELECT CLIENT HANDLER: when a client is selected, update state and mark their inbound messages as read
  const handleSelectClient = (id: string) => {
    setSelectedClientId(id);
    setReplyingTo(null); // Clear active reply state when switching clients

    // Mark all inbound messages of this client as read
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.clientId === id && msg.direction === "in" ? { ...msg, isRead: true } : msg
      )
    );
  };

  // Send message handler: when a message is sent, append it to the messages state
  const handleSendMessage = ({ channel, subject, body }: { channel: Channel; subject?: string; body: string }) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      clientId: selectedClientId,
      direction: "out",
      channel,
      timestamp: new Date().toISOString(),
      sender: "Alex Rivera",
      senderType: "human",
      senderInitials: "AR",
      senderLabel: "AR Specialist · Manual Follow-up",
      subject: channel === "email" ? subject : undefined,
      body,
      status: "delivered",
    };

    // Append new message to local state
    setMessages((prev) => [...prev, newMessage]);
    setReplyingTo(null);
  };

  return (
    <div className="-m-8 flex h-[calc(100vh-57px)] w-[calc(100%+4rem)] bg-slate-100 font-sans text-slate-800 overflow-hidden">
      {/* Client List */}
      <ClientList
        clients={clients}
        messages={messages}
        selectedClientId={selectedClientId}
        onSelectClient={handleSelectClient}
      />

      {/* Header, Feed and Composer */}
      <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-50 border-r border-slate-200 overflow-hidden">
        {/* Fixed Top Header */}
        <ConversationHeader client={currentClient} />

        {/* Scrollable Message Feed */}
        <MessageFeed
          messages={activeMessages}
          onReply={(selectedMsg) => setReplyingTo(selectedMsg)}
        />

        {/* Fixed Bottom Composer */}
        <MessageComposer
          client={currentClient}
          replyingTo={replyingTo}
          recipientEmail={currentClient?.email}
          recipientPhone={currentClient?.phone}
          onCancelReply={() => setReplyingTo(null)}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}