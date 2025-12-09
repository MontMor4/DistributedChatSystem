package com.chat.auth.dto;

import lombok.*;

import java.util.UUID;

public record AuthResponse(@NonNull String token, @NonNull UUID userId, @NonNull String username) {
}
