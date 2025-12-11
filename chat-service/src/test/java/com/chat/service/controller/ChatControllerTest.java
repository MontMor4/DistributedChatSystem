package com.chat.service.controller;

import com.chat.service.dto.ChatMessage;
import com.chat.service.model.Message;
import com.chat.service.redis.RedisPublisher;
import com.chat.service.repository.MessageRepository;
import com.chat.service.service.ChatRoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

class ChatControllerTest {

    @Mock
    private RedisPublisher redisPublisher;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ChatRoomService chatRoomService;

    @InjectMocks
    private ChatController chatController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldSaveAndPublishMessage() {
        UUID senderId = UUID.randomUUID();
        String roomId = "room1";
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setChatRoomId(roomId);
        chatMessage.setSenderId(senderId);
        chatMessage.setContent("Hello World");
        chatMessage.setType("CHAT");

        chatController.sendMessage(chatMessage);

        verify(messageRepository, times(1)).save(any(Message.class));
        verify(redisPublisher, times(1)).publish(chatMessage);
    }
}
