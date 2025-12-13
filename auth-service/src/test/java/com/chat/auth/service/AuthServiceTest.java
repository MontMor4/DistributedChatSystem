package com.chat.auth.service;

import com.chat.auth.dto.AuthResponse;
import com.chat.auth.dto.LoginRequest;
import com.chat.auth.dto.RegisterRequest;
import com.chat.auth.dto.UserResponse;
import com.chat.auth.exception.UserAlreadyExistsException;
import com.chat.auth.exception.UserNotFoundException;
import com.chat.auth.model.User;
import com.chat.auth.repository.UserRepository;
import com.chat.auth.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_ShouldReturnAuthResponse_WhenUserIsValid() {
        // Arrange
        RegisterRequest request = new RegisterRequest("testuser", "password", "Test User");
        UUID userId = UUID.randomUUID();

        when(userRepository.existsByUsername(request.username())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encodedPassword");

        doAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(userId);
            return u;
        }).when(userRepository).save(any(User.class));

        when(jwtUtil.generateToken(anyString(), any(UUID.class))).thenReturn("jwt-token");

        // Act
        AuthResponse response = authService.register(request);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.token());
        assertEquals("testuser", response.username());
        assertEquals(userId, response.userId());

        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_ShouldThrowException_WhenUsernameExists() {
        // Arrange
        RegisterRequest request = new RegisterRequest("existinguser", "password", "Test User");
        when(userRepository.existsByUsername(request.username())).thenReturn(true);

        // Act & Assert
        assertThrows(UserAlreadyExistsException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_ShouldReturnAuthResponse_WhenCredentialsAreValid() {
        // Arrange
        LoginRequest request = new LoginRequest("testuser", "password");
        UUID userId = UUID.randomUUID();
        User user = User.builder()
                .id(userId)
                .username("testuser")
                .passwordHash("encodedPassword")
                .fullName("Test User")
                .build();

        when(userRepository.findByUsername(request.username())).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(user.getUsername(), user.getId())).thenReturn("jwt-token");

        // Act
        AuthResponse response = authService.login(request);

        // Assert
        assertNotNull(response);
        assertEquals("jwt-token", response.token());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        LoginRequest request = new LoginRequest("nonexistent", "password");

        // So we can mock authenticate to do nothing (success)
        // And mock findByUsername to return empty.

        when(userRepository.findByUsername(request.username())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> authService.login(request));
    }

    @Test
    void getAllUsers_ShouldReturnListOfUsers() {
        // Arrange
        User user1 = User.builder().id(UUID.randomUUID()).username("user1").fullName("User One").build();
        User user2 = User.builder().id(UUID.randomUUID()).username("user2").fullName("User Two").build();
        when(userRepository.findAll()).thenReturn(List.of(user1, user2));

        // Act
        List<UserResponse> users = authService.getAllUsers();

        // Assert
        assertEquals(2, users.size());
        assertEquals("user1", users.get(0).username());
        assertEquals("user2", users.get(1).username());
    }
}

