package com.chat.auth.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.UUID;

public record UserResponse(@NotEmpty UUID id, @NotEmpty String username, @NotEmpty String fullName) {
}

