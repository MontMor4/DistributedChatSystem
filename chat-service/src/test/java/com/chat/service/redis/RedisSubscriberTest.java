package com.chat.service.redis;

import com.chat.service.dto.ChatMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.connection.Message;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.io.IOException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RedisSubscriberTest {

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private RedisSubscriber redisSubscriber;

    @Test
    void onMessage_ShouldDeserializeAndBroadcast() throws IOException {
        // Arrange
        String chatRoomId = "room-1";
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setChatRoomId(chatRoomId);
        chatMessage.setContent("Hello");

        byte[] messageBody = "{}".getBytes();
        byte[] channel = "chatTopic".getBytes();

        Message message = mock(Message.class);
        when(message.getBody()).thenReturn(messageBody);
        when(message.getChannel()).thenReturn(channel);

        when(objectMapper.readValue(messageBody, ChatMessage.class)).thenReturn(chatMessage);

        // Act
        redisSubscriber.onMessage(message, null);

        // Assert
        verify(objectMapper, times(1)).readValue(messageBody, ChatMessage.class);
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/room/" + chatRoomId), eq(chatMessage));
    }
}

