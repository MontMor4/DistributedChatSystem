import { useState, useEffect } from "react"
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ChatSidebar } from '@/components/ChatSidebar'
import { ChatWindow } from '@/components/ChatWindow'
import { Client } from "@stomp/stompjs"
import { usersQueryOptions, messagesQueryOptions, userSessionQueryOptions, ChatHistoryResponse, User, Message } from "@/lib/api"
import { ChatSession } from "@/data/mock-chat"
import { env } from "@/env"
import { z } from "zod"

const chatSearchSchema = z.object({
  userId: z.string().optional(),
})

export const Route = createFileRoute('/chat')({
  validateSearch: (search) => chatSearchSchema.parse(search),
  loaderDeps: ({ search: { userId } }) => ({ userId }),
  loader: async ({ context, deps: { userId } }) => {
    const { queryClient } = context
    
    const session = await queryClient.ensureQueryData(userSessionQueryOptions())
    
    if (!session || !session.token) {
       throw redirect({
          to: '/login',
       })
    }
    
    await Promise.all([
      // queryClient.ensureQueryData(usersQueryOptions()),
      // userId ? queryClient.ensureQueryData(messagesQueryOptions(userId)) : Promise.resolve(),
    ])
  },
  component: ChatPage,
})

function ChatPage() {
    const queryClient = useQueryClient();
    const search = Route.useSearch()
    const navigate = Route.useNavigate()
    const selectedUserId = search.userId
    
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [connected, setConnected] = useState(false);

    // Fetch current user from session
    const { data: currentUserData } = useSuspenseQuery(userSessionQueryOptions());

    const currentUser = currentUserData ? { id: currentUserData.userId, ...currentUserData } : null;

    // Fetch users
    const { data: users } = useSuspenseQuery(usersQueryOptions());

    // Fetch messages for selected user
    const { data: historyData } = useSuspenseQuery(messagesQueryOptions(selectedUserId));

    // WebSocket connection
    useEffect(() => {
        if (!currentUser || !currentUser.token) return;

        const client = new Client({
            brokerURL: env.VITE_WS_CHAT,
            connectHeaders: {
                Authorization: `Bearer ${currentUser.token}`
            },
            onConnect: () => {
                console.log("Connected to WebSocket");
                setConnected(true);
            },
            onDisconnect: () => {
                console.log("Disconnected from WebSocket");
                setConnected(false);
            },
            onStompError: (frame) => {
                console.error("Broker reported error: " + frame.headers['message']);
                console.error("Additional details: " + frame.body);
            },
        });

        client.activate();
        setStompClient(client);

        return () => {
            client.deactivate();
        };
    }, [currentUser?.id, currentUser?.token]);

    // Subscription management
    useEffect(() => {
        if (!stompClient || !connected || !historyData?.chatRoomId) return;

        console.log("Subscribing to room:", historyData.chatRoomId);
        const subscription = stompClient.subscribe(`/topic/room/${historyData.chatRoomId}`, (message) => {
            const body = JSON.parse(message.body);
            console.log("Received message:", body);
            
            queryClient.setQueryData(['messages', selectedUserId], (oldData: ChatHistoryResponse | undefined) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    messages: [...oldData.messages, body]
                };
            });
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [stompClient, connected, historyData?.chatRoomId, selectedUserId, queryClient]);

    const handleSendMessage = (content: string) => {
        console.log("Attempting to send message:", content);
        console.log("State:", { 
            stompClient: !!stompClient, 
            connected, 
            chatRoomId: historyData?.chatRoomId, 
            currentUser: !!currentUser 
        });

        if (stompClient && connected && historyData?.chatRoomId && currentUser) {
            const chatMessage = {
                chatRoomId: historyData.chatRoomId,
                senderId: currentUser.id,
                content: content,
                type: 'CHAT'
            };
            console.log("Publishing message:", chatMessage);
            stompClient.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(chatMessage)
            });
        } else {
            console.warn("Cannot send message: Missing dependencies");
        }
    };

    const handleSelectChat = (userId: string) => {
        navigate({ search: { userId } })
    }

    // Map users to ChatSession format for Sidebar
    const chats: ChatSession[] = (users || [])
        .filter((u: User) => u.id !== currentUser?.id)
        .map((u: User) => ({
            id: u.id, 
            contact: { id: u.id, name: u.fullName || u.username },
            messages: [] 
        }));

    // Construct selected chat session for Window
    const selectedChat: ChatSession | undefined = selectedUserId && users ? {
        id: selectedUserId,
        contact: { 
            id: selectedUserId, 
            name: users.find((u: User) => u.id === selectedUserId)?.fullName || 'User' 
        },
        messages: historyData?.messages.map((m: Message) => ({
            id: m.id || 'temp-' + Date.now() + Math.random(), 
            senderId: m.senderId === currentUser?.id ? 'me' : m.senderId,
            content: m.content,
            timestamp: new Date(m.timestamp)
        })) || []
    } : undefined;

    return (
         <div className="flex h-[calc(100vh-73px)] w-full overflow-hidden bg-background">
          <div className="w-80 shrink-0 h-full">
            <ChatSidebar 
              chats={chats} 
              selectedChatId={selectedUserId} 
              onSelectChat={handleSelectChat} 
            />
          </div>
          <div className="flex-1 h-full min-w-0">
            <ChatWindow 
              chat={selectedChat} 
              onSendMessage={handleSendMessage} 
            />
          </div>
        </div>
    );
}
