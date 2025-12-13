package com.chat.service.controller;

import com.chat.service.dto.ChatHistoryResponse;
import com.chat.service.dto.ChatMessage;
import com.chat.service.model.Message;
import com.chat.service.redis.RedisPublisher;
import com.chat.service.repository.MessageRepository;
import com.chat.service.service.ChatRoomService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    private RedisPublisher redisPublisher;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ChatRoomService chatRoomService;

    @InjectMocks
    private ChatController chatController;

    @Test
    void sendMessage_ShouldSaveAndPublishMessage() {
        // Arrange
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setChatRoomId("room-1");
        chatMessage.setSenderId(UUID.randomUUID());
        chatMessage.setContent("Hello");

        Message savedMessage = Message.builder()
                .id("msg-1")
                .chatRoomId(chatMessage.getChatRoomId())
                .senderId(chatMessage.getSenderId())
                .content(chatMessage.getContent())
                .timestamp(LocalDateTime.now())
                .build();

        when(messageRepository.save(any(Message.class))).thenReturn(savedMessage);

        // Act
        chatController.sendMessage(chatMessage);

        // Assert
        verify(messageRepository, times(1)).save(any(Message.class));
        verify(redisPublisher, times(1)).publish(chatMessage);
        assertNotNull(chatMessage.getTimestamp());
    }

    @Test
    void getChatMessages_ShouldReturnHistory() {
        // Arrange
        UUID senderId = UUID.randomUUID();
        UUID recipientId = UUID.randomUUID();
        String chatRoomId = "room-1";

        Message msg1 = Message.builder().id("1").content("Hi").build();
        Message msg2 = Message.builder().id("2").content("Hello").build();
        List<Message> messages = Arrays.asList(msg1, msg2);

        when(chatRoomService.getChatRoomId(senderId, recipientId, true)).thenReturn(chatRoomId);
        when(messageRepository.findByChatRoomIdOrderByTimestampAsc(chatRoomId)).thenReturn(messages);

        // Act
        ResponseEntity<ChatHistoryResponse> response = chatController.getChatMessages(senderId, recipientId);

        // Assert
        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(chatRoomId, response.getBody().chatRoomId());
        assertEquals(2, response.getBody().messages().size());
    }
}

