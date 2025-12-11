import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from '@tanstack/react-router'
import { ChatSidebar } from '@/components/ChatSidebar'
import { ChatWindow } from '@/components/ChatWindow'
import { Client } from "@stomp/stompjs"
import { fetchUsers, fetchMessages, ChatHistoryResponse } from "@/lib/api"
import { ChatSession } from "@/data/mock-chat"
import { env } from "@/env"

export const Route = createFileRoute('/chat')({
  component: ChatPage,
})

function ChatPage() {
    const queryClient = useQueryClient();
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            setCurrentUser(JSON.parse(userStr));
        }
    }, []);

    // Fetch users
    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    // Fetch messages for selected user
    const { data: historyData } = useQuery({
        queryKey: ['messages', selectedUserId],
        queryFn: () => selectedUserId ? fetchMessages(selectedUserId) : Promise.resolve(null),
        enabled: !!selectedUserId
    });

    // WebSocket connection
    useEffect(() => {
        if (!currentUser) return;

        const client = new Client({
            brokerURL: env.VITE_WS_CHAT,
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
    }, [currentUser]);

    // Subscription management
    useEffect(() => {
        if (!stompClient || !connected || !historyData?.chatRoomId) return;

        console.log("Subscribing to room:", historyData.chatRoomId);
        const subscription = stompClient.subscribe(`/topic/room/${historyData.chatRoomId}`, (message) => {
            const body = JSON.parse(message.body);
            console.log("Received message:", body);
            
            queryClient.setQueryData(['messages', selectedUserId], (oldData: ChatHistoryResponse | undefined) => {
                if (!oldData) return oldData;
                // Avoid duplicates if needed, but here simple append
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
        if (stompClient && connected && historyData?.chatRoomId && currentUser) {
            const chatMessage = {
                chatRoomId: historyData.chatRoomId,
                senderId: currentUser.id,
                content: content,
                type: 'CHAT'
            };
            stompClient.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(chatMessage)
            });
        }
    };

    // Map users to ChatSession format for Sidebar
    const chats: ChatSession[] = (users || [])
        .filter((u: any) => u.id !== currentUser?.id)
        .map((u: any) => ({
            id: u.id, 
            contact: { id: u.id, name: u.fullName || u.username },
            messages: [] 
        }));

    // Construct selected chat session for Window
    const selectedChat: ChatSession | undefined = selectedUserId && users ? {
        id: selectedUserId,
        contact: { 
            id: selectedUserId, 
            name: users.find((u: any) => u.id === selectedUserId)?.fullName || 'User' 
        },
        messages: historyData?.messages.map((m: any) => ({
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
              onSelectChat={setSelectedUserId} 
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
