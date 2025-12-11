package com.chat.service.redis;

import com.chat.service.dto.ChatMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @SneakyThrows
    public void onMessage(Message message, byte[] pattern) {
        log.info("Received message from Redis topic: {}", new String(message.getChannel()));
        ChatMessage chatMessage = objectMapper.readValue(message.getBody(), ChatMessage.class);
        log.info("Broadcasting message to WebSocket: /topic/room/{}", chatMessage.getChatRoomId());
        // Broadcast to local WebSocket clients subscribed to this room
        messagingTemplate.convertAndSend("/topic/room/" + chatMessage.getChatRoomId(), chatMessage);
    }
}
