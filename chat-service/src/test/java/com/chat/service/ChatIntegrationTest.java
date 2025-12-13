package com.chat.service;

import com.chat.service.model.Message;
import com.chat.service.repository.MessageRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class ChatIntegrationTest {

    @Autowired
    private MessageRepository messageRepository;

    // Mock Redis to avoid need for real Redis in this specific test
    @MockBean
    private RedisTemplate<String, Object> redisTemplate;

    @Test
    public void shouldPersistAndRetrieveMessages() {
        String chatRoomId = "room-integration-test";
        UUID senderId = UUID.randomUUID();

        Message message = Message.builder()
                .chatRoomId(chatRoomId)
                .senderId(senderId)
                .content("Integration Test Message")
                .timestamp(LocalDateTime.now())
                .build();

        messageRepository.save(message);

        List<Message> retrieved = messageRepository.findByChatRoomIdOrderByTimestampAsc(chatRoomId);

        assertFalse(retrieved.isEmpty());
        assertEquals(1, retrieved.size());
        assertEquals("Integration Test Message", retrieved.get(0).getContent());
    }
}
