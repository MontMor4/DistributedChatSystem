package com.chat.service.service;

import com.chat.service.model.ChatRoom;
import com.chat.service.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    private final ChatRoomRepository chatRoomRepository;

    public String getChatRoomId(UUID senderId, UUID recipientId, boolean createNewRoomIfNotExists) {
        List<UUID> participantIds = Arrays.asList(senderId, recipientId);

        return chatRoomRepository.findByParticipantIds(participantIds)
                .map(ChatRoom::getId)
                .orElseGet(() -> {
                    if (createNewRoomIfNotExists) {
                        ChatRoom chatRoom = ChatRoom.builder()
                                .participantIds(participantIds)
                                .build();
                        return chatRoomRepository.save(chatRoom).getId();
                    }
                    return null;
                });
    }
}
