package com.chat.auth.dto;

import java.util.UUID;

public record UserResponse(UUID id, String username, String fullName) {
}

