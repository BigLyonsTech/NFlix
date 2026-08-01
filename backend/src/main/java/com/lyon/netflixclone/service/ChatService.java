package com.lyon.netflixclone.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lyon.netflixclone.dto.ChatDtos.ChatMessage;
import com.lyon.netflixclone.model.Content;
import com.lyon.netflixclone.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Streams a catalog-grounded chat reply from OpenAI's Chat Completions API
 * (SSE, "stream": true). The system prompt is the only thing keeping the
 * assistant on-topic - there's no server-side moderation beyond that.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ContentRepository contentRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.openai.api-key}")
    private String apiKey;

    @Value("${app.openai.model}")
    private String model;

    @Value("${app.openai.base-url}")
    private String baseUrl;

    public Flux<String> streamChat(List<ChatMessage> history) {
        if (apiKey == null || apiKey.isBlank()) {
            return Flux.just("The AI assistant isn't configured on this server yet - ask the admin to set OPENAI_API_KEY.");
        }
        if (history == null || history.isEmpty()) {
            return Flux.just("Ask me anything about what's in the catalog!");
        }

        List<Content> catalog = contentRepository.findAll();
        String systemPrompt = buildSystemPrompt(catalog);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        history.forEach(m -> messages.add(Map.of("role", m.role(), "content", m.content())));

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", messages,
                "temperature", 0.7,
                "stream", true
        );

        WebClient client = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();

        return client.post()
                .uri("/chat/completions")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<ServerSentEvent<String>>() {})
                .mapNotNull(sse -> extractDelta(sse.data()))
                .onErrorResume(e -> {
                    log.warn("OpenAI chat stream failed: {}", e.getMessage());
                    return Flux.just("Sorry, I couldn't reach the AI assistant just now. Try again in a moment.");
                });
    }

    private String buildSystemPrompt(List<Content> catalog) {
        String catalogList = catalog.stream()
                .map(c -> "- %s (%s)%s".formatted(
                        c.getTitle(),
                        c.getGenres() == null || c.getGenres().isEmpty() ? "misc" : String.join(", ", c.getGenres()),
                        c.getYear() != null ? ", " + c.getYear() : ""))
                .collect(Collectors.joining("\n"));

        return """
                You are the "Netflix Assistant", a friendly concierge for this streaming app.
                You ONLY discuss and recommend titles from the catalog below - never invent
                titles that aren't listed, and never discuss unrelated topics (coding, news,
                personal advice, etc). If asked something off-topic, briefly redirect the user
                back to picking something to watch.

                Catalog:
                %s

                Keep replies short (2-4 sentences), warm, and conversational - this is a chat
                widget, not an essay.
                """.formatted(catalogList);
    }

    private String extractDelta(String rawData) {
        if (rawData == null || rawData.isBlank() || rawData.equals("[DONE]")) {
            return null;
        }
        try {
            JsonNode node = objectMapper.readTree(rawData);
            JsonNode delta = node.at("/choices/0/delta/content");
            return delta.isMissingNode() || delta.isNull() ? null : delta.asText();
        } catch (Exception e) {
            return null;
        }
    }
}
