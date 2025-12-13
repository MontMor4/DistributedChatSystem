package com.chat.auth.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.UUID;

public record AuthResponse(@NotEmpty String token, @NotEmpty UUID userId, @NotEmpty String username) {
}
