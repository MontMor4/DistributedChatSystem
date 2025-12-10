import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChatSession } from "@/data/mock-chat"

interface ChatSidebarProps {
  chats: ChatSession[]
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
  className?: string
}

export function ChatSidebar({ chats, selectedChatId, onSelectChat, className }: ChatSidebarProps) {
  return (
    <div className={cn("flex flex-col h-full border-r bg-muted/10", className)}>
      <div className="p-4 font-bold text-xl">Chats</div>
      <Separator />
      <div className="flex-1 overflow-y-auto py-2">
        <div className="flex flex-col gap-1 px-2">
          {chats.map((chat) => (
            <Button
              key={chat.id}
              variant={selectedChatId === chat.id ? "secondary" : "ghost"}
              className={cn(
                "justify-start h-auto py-3 px-4 w-full text-left",
                selectedChatId === chat.id && "bg-muted"
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary/10 items-center justify-center">
                   <span className="font-semibold text-sm">{chat.contact.name.substring(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex flex-col items-start overflow-hidden w-full">
                  <div className="flex w-full items-center justify-between">
                    <span className="font-semibold truncate">{chat.contact.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {chat.messages[chat.messages.length - 1]?.content || "No messages"}
                  </span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
