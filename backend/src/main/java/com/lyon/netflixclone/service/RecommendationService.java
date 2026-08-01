package com.lyon.netflixclone.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lyon.netflixclone.dto.ContentDtos.ContentResponse;
import com.lyon.netflixclone.dto.MiscDtos.RecommendationResponse;
import com.lyon.netflixclone.model.Content;
import com.lyon.netflixclone.model.User;
import com.lyon.netflixclone.repository.ContentRepository;
import com.lyon.netflixclone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Calls the OpenAI Chat Completions API to pick a short, personalized list of
 * titles from our own catalog based on what the user has watched / saved.
 * The API key never reaches the frontend - this service is the only thing
 * that talks to OpenAI.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final UserRepository userRepository;
    private final ContentRepository contentRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.openai.api-key}")
    private String apiKey;

    @Value("${app.openai.model}")
    private String model;

    @Value("${app.openai.base-url}")
    private String baseUrl;

    public RecommendationResponse recommendFor(String userId) {
        List<Content> catalog = contentRepository.findAll();

        if (catalog.isEmpty()) {
            return new RecommendationResponse(List.of(), "Catalog is empty.");
        }

        User user = userRepository.findById(userId).orElse(null);

        if (apiKey == null || apiKey.isBlank()) {
            // No key configured (e.g. local dev without a key yet) -> graceful fallback
            return fallbackRecommendation(catalog);
        }

        try {
            List<Content> watched = user == null ? List.of()
                    : contentRepository.findByIdIn(List.copyOf(user.getWatchProgress().keySet()));

            String prompt = buildPrompt(catalog, watched);
            String rawResponse = callOpenAi(prompt);
            return parseRecommendation(rawResponse, catalog);
        } catch (Exception e) {
            log.warn("OpenAI recommendation call failed, falling back to defaults: {}", e.getMessage());
            return fallbackRecommendation(catalog);
        }
    }

    private String buildPrompt(List<Content> catalog, List<Content> watched) {
        String catalogList = catalog.stream()
                .map(c -> "- id: %s | title: %s | genres: %s".formatted(
                        c.getId(), c.getTitle(),
                        c.getGenres() == null ? "" : String.join(",", c.getGenres())))
                .collect(Collectors.joining("\n"));

        String watchedList = watched.isEmpty() ? "none yet"
                : watched.stream().map(Content::getTitle).collect(Collectors.joining(", "));

        return """
                You are a movie recommendation engine for a streaming app.
                Here is the full catalog (id | title | genres):
                %s

                The user has watched/saved: %s

                Pick up to 5 ids from the catalog above that this user would most enjoy next.
                Respond ONLY with strict JSON, no markdown, in this exact shape:
                {"ids": ["id1", "id2"], "reason": "one short sentence"}
                """.formatted(catalogList, watchedList);
    }

    private String callOpenAi(String prompt) {
        WebClient client = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", "You return only strict JSON, never prose."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.7
        );

        JsonNode response = client.post()
                .uri("/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        return response.at("/choices/0/message/content").asText();
    }

    private RecommendationResponse parseRecommendation(String raw, List<Content> catalog) throws Exception {
        String cleaned = raw.trim()
                .replaceAll("^```json", "")
                .replaceAll("^```", "")
                .replaceAll("```$", "")
                .trim();

        JsonNode node = objectMapper.readTree(cleaned);
        List<String> ids = objectMapper.convertValue(node.get("ids"), List.class);
        String reason = node.has("reason") ? node.get("reason").asText() : "Picked for you.";

        List<ContentResponse> recs = catalog.stream()
                .filter(c -> ids.contains(c.getId()))
                .map(c -> ContentService.toResponse(c, null))
                .toList();

        return new RecommendationResponse(recs, reason);
    }

    private RecommendationResponse fallbackRecommendation(List<Content> catalog) {
        List<ContentResponse> top = catalog.stream()
                .limit(5)
                .map(c -> ContentService.toResponse(c, null))
                .toList();
        return new RecommendationResponse(top, "Popular picks from our catalog.");
    }
}
