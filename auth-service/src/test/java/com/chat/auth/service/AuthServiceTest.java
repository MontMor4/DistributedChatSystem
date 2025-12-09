package com.chat.auth.service;

import com.chat.auth.dto.AuthResponse;
import com.chat.auth.dto.LoginRequest;
import com.chat.auth.dto.RegisterRequest;
import com.chat.auth.model.User;
import com.chat.auth.repository.UserRepository;
import com.chat.auth.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldRegisterUserSuccessfully() {
        RegisterRequest request = new RegisterRequest("testuser", "password", "Test User");
        User savedUser = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .passwordHash("encoded_password")
                .fullName("Test User")
                .build();

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken(anyString(), any(UUID.class))).thenReturn("jwt_token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("jwt_token", response.token());
        assertEquals("testuser", response.username());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenUsernameExists() {
        RegisterRequest request = new RegisterRequest("existinguser", "password", "Test User");
        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldLoginSuccessfully() {
        LoginRequest request = new LoginRequest("testuser", "password");
        User user = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .passwordHash("encoded_password")
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(anyString(), any(UUID.class))).thenReturn("jwt_token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt_token", response.token());
        verify(authenticationManager, times(1)).authenticate(any());
    }
}
