package com.chat.service.controller;

import com.chat.service.dto.ChatHistoryResponse;
import com.chat.service.dto.ChatMessage;
import com.chat.service.model.Message;
import com.chat.service.redis.RedisPublisher;
import com.chat.service.repository.MessageRepository;
import com.chat.service.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final RedisPublisher redisPublisher;
    private final MessageRepository messageRepository;
    private final ChatRoomService chatRoomService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        log.info("Received message via WebSocket: {}", chatMessage);
        // 1. Save to MongoDB
        Message message = Message.builder()
                .chatRoomId(chatMessage.getChatRoomId())
                .senderId(chatMessage.getSenderId())
                .content(chatMessage.getContent())
                .timestamp(LocalDateTime.now())
                .build();
        messageRepository.save(message);
        log.info("Message saved to MongoDB: {}", message.getId());

        // 2. Publish to Redis (Distribute to other instances)
        chatMessage.setTimestamp(message.getTimestamp());
        redisPublisher.publish(chatMessage);
        log.info("Message published to Redis");
    }

    @GetMapping("/messages/{senderId}/{recipientId}")
    public ResponseEntity<ChatHistoryResponse> getChatMessages(@PathVariable UUID senderId, @PathVariable UUID recipientId) {
        String chatId = chatRoomService.getChatRoomId(senderId, recipientId, true);
        List<Message> messages = messageRepository.findByChatRoomIdOrderByTimestampAsc(chatId);
        return ResponseEntity.ok(new ChatHistoryResponse(chatId, messages));
    }
}
