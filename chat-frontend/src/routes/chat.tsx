import { createFileRoute } from '@tanstack/react-router'
import { ChatLayout } from '@/components/ChatLayout'

export const Route = createFileRoute('/chat')({
  component: ChatPage,
})

function ChatPage() {
  return <ChatLayout />
}
