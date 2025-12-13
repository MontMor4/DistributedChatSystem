package com.chat.service.redis;

import com.chat.service.dto.ChatMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RedisPublisherTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @InjectMocks
    private RedisPublisher redisPublisher;

    @Test
    void publish_ShouldConvertAndSendToRedis() {
        // Arrange
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setContent("Test Message");

        // Act
        redisPublisher.publish(chatMessage);

        // Assert
        verify(redisTemplate, times(1)).convertAndSend("chatTopic", chatMessage);
    }
}

