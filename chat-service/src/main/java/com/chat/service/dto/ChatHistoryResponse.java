package com.chat.service.dto;

import com.chat.service.model.Message;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ChatHistoryResponse(@NotEmpty String chatRoomId, @NotNull List<Message> messages) {
}

