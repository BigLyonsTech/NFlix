package com.lyon.netflixclone.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record SignupRequest(
            @NotBlank(message = "Full name is required") String fullName,
            @NotBlank @Email(message = "A valid email is required") String email,
            @NotBlank @Size(min = 6, message = "Password must be at least 6 characters") String password
    ) {}

    public record LoginRequest(
            @NotBlank @Email(message = "A valid email is required") String email,
            @NotBlank(message = "Password is required") String password
    ) {}

    public record AuthResponse(
            String token,
            String id,
            String fullName,
            String email,
            String role
    ) {}
}
