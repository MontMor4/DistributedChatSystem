package com.chat.service.redis;

import com.chat.service.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisPublisher {

    private final RedisTemplate<String, Object> redisTemplate;

    public void publish(ChatMessage message) {
        log.info("Publishing message to Redis topic 'chatTopic': {}", message);
        redisTemplate.convertAndSend("chatTopic", message);
    }
}
