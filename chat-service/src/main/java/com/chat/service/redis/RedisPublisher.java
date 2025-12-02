package com.chat.service.redis;

import com.chat.service.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisPublisher {

    private final RedisTemplate<String, Object> redisTemplate;

    public void publish(ChatMessage message) {
        redisTemplate.convertAndSend("chatTopic", message);
    }
}
