package com.chat.auth.dto;

import jakarta.validation.constraints.NotEmpty;

public record RegisterRequest(@NotEmpty String username, @NotEmpty String password, @NotEmpty String fullName) {
}
