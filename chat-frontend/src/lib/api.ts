import axios from "axios";
import { env } from "@/env";
import { createServerFn } from "@tanstack/react-start";
import { useAppSession } from "@/lib/session";
import { queryOptions } from "@tanstack/react-query";

const AUTH_BASE = env.VITE_API_AUTH;
const CHAT_BASE = env.VITE_API_CHAT;

export const authClient = axios.create({
  baseURL: AUTH_BASE,
});

export const chatClient = axios.create({
  baseURL: CHAT_BASE,
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

export interface ChatHistoryResponse {
  chatRoomId: string;
  messages: Message[];
}

export const getUsersFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession();
    const token = session.data.token;

    // Allow public access or require auth? The prompt implies listing all registered people.
    // Ideally authenticated.
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await authClient.get<User[]>("/users", { headers });
    return response.data;
  }
);

export const usersQueryOptions = () => queryOptions({
  queryKey: ['users'],
  queryFn: () => getUsersFn(),
});

export const getMessagesFn = createServerFn({ method: "GET" })
  .inputValidator((d: string) => d)
  .handler(async ({ data: recipientId }) => {
    const session = await useAppSession();
    const token = session.data.token;
    const userId = session.data.userId;

    if (!token || !userId) {
      throw new Error("Unauthorized");
    }

    const response = await chatClient.get<ChatHistoryResponse>(
      `/messages/${userId}/${recipientId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  });

export const messagesQueryOptions = (recipientId: string | undefined) => queryOptions({
  queryKey: ['messages', recipientId],
  queryFn: () => recipientId ? getMessagesFn({ data: recipientId }) : Promise.resolve(null),
  enabled: !!recipientId,
});

export const getUserSessionFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession();
    return session.data;
  }
);

export const userSessionQueryOptions = () => queryOptions({
  queryKey: ['session'],
  queryFn: () => getUserSessionFn(),
});
