package com.chat.service.dto;

import com.chat.service.model.Message;
import java.util.List;

public record ChatHistoryResponse(String chatRoomId, List<Message> messages) {
}

