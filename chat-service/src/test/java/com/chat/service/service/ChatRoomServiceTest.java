package com.chat.service.service;

import com.chat.service.model.ChatRoom;
import com.chat.service.repository.ChatRoomRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatRoomServiceTest {

    @Mock
    private ChatRoomRepository chatRoomRepository;

    @InjectMocks
    private ChatRoomService chatRoomService;

    @Test
    void getChatRoomId_WhenRoomExists_ShouldReturnRoomId() {
        // Arrange
        UUID senderId = UUID.randomUUID();
        UUID recipientId = UUID.randomUUID();
        String expectedRoomId = "room-123";
        ChatRoom existingRoom = ChatRoom.builder()
                .id(expectedRoomId)
                .participantIds(Arrays.asList(senderId, recipientId))
                .build();

        when(chatRoomRepository.findByParticipantIds(anyList())).thenReturn(Optional.of(existingRoom));

        // Act
        String roomId = chatRoomService.getChatRoomId(senderId, recipientId, true);

        // Assert
        assertEquals(expectedRoomId, roomId);
        verify(chatRoomRepository, times(1)).findByParticipantIds(anyList());
        verify(chatRoomRepository, never()).save(any(ChatRoom.class));
    }

    @Test
    void getChatRoomId_WhenRoomDoesNotExistAndCreateTrue_ShouldCreateAndReturnRoomId() {
        // Arrange
        UUID senderId = UUID.randomUUID();
        UUID recipientId = UUID.randomUUID();
        String newRoomId = "new-room-123";
        ChatRoom newRoom = ChatRoom.builder()
                .id(newRoomId)
                .participantIds(Arrays.asList(senderId, recipientId))
                .build();

        when(chatRoomRepository.findByParticipantIds(anyList())).thenReturn(Optional.empty());
        when(chatRoomRepository.save(any(ChatRoom.class))).thenReturn(newRoom);

        // Act
        String roomId = chatRoomService.getChatRoomId(senderId, recipientId, true);

        // Assert
        assertEquals(newRoomId, roomId);
        verify(chatRoomRepository, times(1)).findByParticipantIds(anyList());
        verify(chatRoomRepository, times(1)).save(any(ChatRoom.class));
    }

    @Test
    void getChatRoomId_WhenRoomDoesNotExistAndCreateFalse_ShouldReturnNull() {
        // Arrange
        UUID senderId = UUID.randomUUID();
        UUID recipientId = UUID.randomUUID();

        when(chatRoomRepository.findByParticipantIds(anyList())).thenReturn(Optional.empty());

        // Act
        String roomId = chatRoomService.getChatRoomId(senderId, recipientId, false);

        // Assert
        assertNull(roomId);
        verify(chatRoomRepository, times(1)).findByParticipantIds(anyList());
        verify(chatRoomRepository, never()).save(any(ChatRoom.class));
    }
}

