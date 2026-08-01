package com.lyon.netflixclone.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lyon.netflixclone.dto.ChatDtos.ChatMessage;
import com.lyon.netflixclone.repository.ContentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock private ContentRepository contentRepository;

    private ChatService chatService;

    @BeforeEach
    void setUp() {
        chatService = new ChatService(contentRepository, new ObjectMapper());
    }

    @Test
    void streamChat_fallsBackToSetupMessage_whenApiKeyMissing() {
        List<String> chunks = chatService.streamChat(List.of(new ChatMessage("user", "hi")))
                .collectList()
                .block();

        assertThat(chunks).containsExactly(
                "The AI assistant isn't configured on this server yet - ask the admin to set OPENAI_API_KEY.");
        verifyNoInteractions(contentRepository);
    }

    @Test
    void streamChat_promptsUser_whenHistoryEmpty() {
        ReflectionTestUtils.setField(chatService, "apiKey", "test-key");

        List<String> chunks = chatService.streamChat(List.of()).collectList().block();

        assertThat(chunks).containsExactly("Ask me anything about what's in the catalog!");
        verifyNoInteractions(contentRepository);
    }

    @Test
    void streamChat_promptsUser_whenHistoryNull() {
        ReflectionTestUtils.setField(chatService, "apiKey", "test-key");

        List<String> chunks = chatService.streamChat(null).collectList().block();

        assertThat(chunks).containsExactly("Ask me anything about what's in the catalog!");
        verifyNoInteractions(contentRepository);
    }
}
