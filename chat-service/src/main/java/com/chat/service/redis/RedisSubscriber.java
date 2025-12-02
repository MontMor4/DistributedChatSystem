package com.chat.service.redis;

import com.chat.service.dto.ChatMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @SneakyThrows
    public void onMessage(Message message, byte[] pattern) {
        ChatMessage chatMessage = objectMapper.readValue(message.getBody(), ChatMessage.class);
        // Broadcast to local WebSocket clients subscribed to this room
        messagingTemplate.convertAndSend("/topic/room/" + chatMessage.getChatRoomId(), chatMessage);
    }
}
