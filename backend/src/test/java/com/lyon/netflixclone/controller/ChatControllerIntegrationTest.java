package com.lyon.netflixclone.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression test for the bug where a Flux<String> controller triggers a
 * Servlet async re-dispatch on a different thread, on which Spring
 * Security's AuthorizationFilter re-runs - see JwtAuthFilter's use of
 * RequestAttributeSecurityContextRepository. Without that fix, this test
 * fails with a 403/401 on the asyncDispatch step even though the initial
 * request carried a valid token.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ChatControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private ContentRepository contentRepository;

    @AfterEach
    void cleanUp() {
        userRepository.deleteAll();
        contentRepository.deleteAll();
    }

    private String signUpAndGetToken() throws Exception {
        SignupRequest signup = new SignupRequest("Lyon Dev", "chat-user@example.com", "password123");
        MvcResult result = mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    void chat_succeedsThroughAsyncRedispatch_withValidToken() throws Exception {
        String token = signUpAndGetToken();

        MvcResult mvcResult = mockMvc.perform(post("/api/chat")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"messages\":[]}"))
                .andExpect(request().asyncStarted())
                .andReturn();

        mockMvc.perform(asyncDispatch(mvcResult))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Ask me anything about what's in the catalog!")));
    }

    @Test
    void chat_rejectsRequestWithoutToken() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"messages\":[]}"))
                .andExpect(status().isUnauthorized());
    }
}
