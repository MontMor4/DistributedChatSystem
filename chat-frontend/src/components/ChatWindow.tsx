import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ChatSession } from "@/data/mock-chat"
import { Send } from "lucide-react"
import { useState } from "react"

interface ChatWindowProps {
  chat?: ChatSession
  onSendMessage: (content: string) => void
}

export function ChatWindow({ chat, onSendMessage }: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("")

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue)
      setInputValue("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend()
    }
  }

  if (!chat) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a chat to start messaging
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 h-16">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-primary/10 items-center justify-center">
             <span className="font-semibold text-xs">{chat.contact.name.substring(0, 2).toUpperCase()}</span>
          </div>
          <div className="font-semibold">{chat.contact.name}</div>
        </div>
      </div>
      <Separator />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((message) => {
          const isMe = message.senderId === "me"
          return (
            <div
              key={message.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                  isMe
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.content}
                <div className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
