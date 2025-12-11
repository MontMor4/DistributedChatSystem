import axios from "axios";
import { env } from "@/env";

// Using env variables directly
const AUTH_BASE = env.VITE_API_AUTH;
const CHAT_BASE = env.VITE_API_CHAT;

export const authClient = axios.create({
	baseURL: AUTH_BASE,
});

export const chatClient = axios.create({
	baseURL: CHAT_BASE,
});

// Interceptor to add JWT token
chatClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // Assuming token is stored here
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

authClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


export interface User {
    id: string;
    username: string;
    fullName: string;
}

export interface Message {
    id?: string;
    chatRoomId: string;
    senderId: string;
    content: string;
    timestamp: string;
}

export const fetchUsers = async () => {
    const response = await authClient.get<User[]>("/users");
    return response.data;
};

export const fetchMessages = async (recipientId: string) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) throw new Error("User not logged in");
    
    const response = await chatClient.get<ChatHistoryResponse>(`/messages/${user.id}/${recipientId}`);
    return response.data;
};

export interface ChatHistoryResponse {
    chatRoomId: string;
    messages: Message[];
}
