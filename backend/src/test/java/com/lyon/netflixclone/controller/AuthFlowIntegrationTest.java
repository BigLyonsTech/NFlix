package com.lyon.netflixclone.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lyon.netflixclone.dto.AuthDtos.LoginRequest;
import com.lyon.netflixclone.dto.AuthDtos.SignupRequest;
import com.lyon.netflixclone.repository.ContentRepository;
import com.lyon.netflixclone.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private ContentRepository contentRepository;

    @AfterEach
    void cleanUp() {
        userRepository.deleteAll();
        contentRepository.deleteAll();
    }

    @Test
    void signupThenLogin_succeedsAndReturnsToken() throws Exception {
        SignupRequest signup = new SignupRequest("Lyon Dev", "lyon@example.com", "password123");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("lyon@example.com"));

        LoginRequest login = new LoginRequest("lyon@example.com", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void signup_rejectsInvalidEmail() throws Exception {
        SignupRequest signup = new SignupRequest("Lyon Dev", "not-an-email", "password123");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void protectedEndpoint_rejectsRequestWithoutToken() throws Exception {
        mockMvc.perform(get("/api/watchlist"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void publicContentEndpoint_worksWithoutToken() throws Exception {
        mockMvc.perform(get("/api/content"))
                .andExpect(status().isOk());
    }
}
