package com.chat.service.repository;

import com.chat.service.model.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRoomRepository extends MongoRepository<ChatRoom, String> {
    @Query("{ 'participantIds': { $all: ?0, $size: 2 } }")
    Optional<ChatRoom> findByParticipantIds(List<UUID> participantIds);
}
