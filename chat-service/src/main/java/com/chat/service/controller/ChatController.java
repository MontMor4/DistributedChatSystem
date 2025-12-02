package com.chat.service.controller;

import com.chat.service.dto.ChatMessage;
import com.chat.service.model.Message;
import com.chat.service.redis.RedisPublisher;
import com.chat.service.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final RedisPublisher redisPublisher;
    private final MessageRepository messageRepository;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        // 1. Save to MongoDB
        Message message = Message.builder()
                .chatRoomId(chatMessage.getChatRoomId())
                .senderId(chatMessage.getSenderId())
                .content(chatMessage.getContent())
                .timestamp(LocalDateTime.now())
                .build();
        messageRepository.save(message);

        // 2. Publish to Redis (Distribute to other instances)
        redisPublisher.publish(chatMessage);
    }
}
