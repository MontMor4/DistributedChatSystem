package com.chat.service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    // Must match the secret in Auth Service
    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String secret;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> authorization = accessor.getNativeHeader("Authorization");
            
            if (authorization != null && !authorization.isEmpty()) {
                String token = authorization.get(0).replace("Bearer ", "");
                try {
                    validateToken(token);
                    // Token is valid, connection proceeds
                    log.info("WebSocket connection authorized");
                } catch (Exception e) {
                    log.error("WebSocket authorization failed", e);
                    throw new RuntimeException("Unauthorized");
                }
            } else {
                throw new RuntimeException("Authorization header missing");
            }
        }
        return message;
    }

    private void validateToken(String token) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);
        
        Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
    }
}
