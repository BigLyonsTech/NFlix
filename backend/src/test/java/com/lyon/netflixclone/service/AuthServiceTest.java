package com.lyon.netflixclone.service;

import com.lyon.netflixclone.dto.AuthDtos.AuthResponse;
import com.lyon.netflixclone.dto.AuthDtos.LoginRequest;
import com.lyon.netflixclone.dto.AuthDtos.SignupRequest;
import com.lyon.netflixclone.exception.ApiExceptions.BadRequestException;
import com.lyon.netflixclone.exception.ApiExceptions.UnauthorizedException;
import com.lyon.netflixclone.model.User;
import com.lyon.netflixclone.repository.UserRepository;
import com.lyon.netflixclone.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User existingUser;

    @BeforeEach
    void setUp() {
        existingUser = User.builder()
                .id("user-1")
                .fullName("Lyon Dev")
                .email("lyon@example.com")
                .passwordHash("hashed-password")
                .role(User.Role.USER)
                .build();
    }

    @Test
    void signup_createsUser_whenEmailNotTaken() {
        SignupRequest request = new SignupRequest("Lyon Dev", "lyon@example.com", "password123");

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenReturn(existingUser);
        when(jwtUtil.generateToken(existingUser.getId(), existingUser.getEmail())).thenReturn("mock-jwt-token");

        AuthResponse response = authService.signup(request);

        assertThat(response.token()).isEqualTo("mock-jwt-token");
        assertThat(response.email()).isEqualTo("lyon@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void signup_throwsBadRequest_whenEmailAlreadyExists() {
        SignupRequest request = new SignupRequest("Lyon Dev", "lyon@example.com", "password123");
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.signup(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_returnsToken_whenCredentialsValid() {
        LoginRequest request = new LoginRequest("lyon@example.com", "password123");

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches(request.password(), existingUser.getPasswordHash())).thenReturn(true);
        when(jwtUtil.generateToken(existingUser.getId(), existingUser.getEmail())).thenReturn("mock-jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.token()).isEqualTo("mock-jwt-token");
        assertThat(response.id()).isEqualTo("user-1");
    }

    @Test
    void login_throwsUnauthorized_whenPasswordWrong() {
        LoginRequest request = new LoginRequest("lyon@example.com", "wrong-password");

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void login_throwsUnauthorized_whenUserNotFound() {
        LoginRequest request = new LoginRequest("nobody@example.com", "password123");
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class);
    }
}
