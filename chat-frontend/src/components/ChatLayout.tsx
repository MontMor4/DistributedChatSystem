import { useState } from "react"
import { ChatSidebar } from "./ChatSidebar"
import { ChatWindow } from "./ChatWindow"
import { MOCK_CHATS, ChatSession } from "@/data/mock-chat"

export function ChatLayout() {
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(MOCK_CHATS[0]?.id)
  const [chats, setChats] = useState<ChatSession[]>(MOCK_CHATS)

  const selectedChat = chats.find(c => c.id === selectedChatId)

  const handleSendMessage = (content: string) => {
    if (!selectedChatId) return

    const newMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      content,
      timestamp: new Date()
    }

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === selectedChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage]
        }
      }
      return chat
    }))
  }

  return (
    <div className="flex h-[calc(100vh-73px)] w-full overflow-hidden bg-background">
      <div className="w-80 shrink-0 h-full">
        <ChatSidebar 
          chats={chats} 
          selectedChatId={selectedChatId} 
          onSelectChat={setSelectedChatId} 
        />
      </div>
      <div className="flex-1 h-full min-w-0">
        <ChatWindow 
          chat={selectedChat} 
          onSendMessage={handleSendMessage} 
        />
      </div>
    </div>
  )
}
