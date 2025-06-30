"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { MessageContext } from "@/context/messagecontext";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaperClipIcon, SendIcon } from "lucide-react";

export default function MessagesPage() {
  const {
    currentConversation,
    messages,
    sendMessage,
    loadMessages,
    markAsRead
  } = useContext(MessageContext);
  
  const [newMessage, setNewMessage] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
      markAsRead(currentConversation.id);
    }
  }, [currentConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!currentConversation || (!newMessage.trim() && !mediaFile)) return;

    try {
      await sendMessage(currentConversation.participantId, newMessage, mediaFile || undefined);
      setNewMessage("");
      setMediaFile(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r">
        <ConversationList />
      </div>
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">{currentConversation.participantName}</h2>
              <p className="text-sm text-gray-500">
                {currentConversation.isOnline ? "Online" : "Offline"}
              </p>
            </div>
            <ScrollArea className="flex-1 p-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  senderName={currentConversation.participantName}
                  senderPhoto={currentConversation.participantPhoto}
                />
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
            <div className="p-4 border-t">
              {mediaFile && (
                <div className="mb-2 p-2 bg-gray-100 rounded flex justify-between items-center">
                  <span className="text-sm truncate">{mediaFile.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMediaFile(null)}
                  >
                    ✕
                  </Button>
                </div>
              )}
              <div className="flex space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PaperClipIcon className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <Button onClick={handleSend}>
                  <SendIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

