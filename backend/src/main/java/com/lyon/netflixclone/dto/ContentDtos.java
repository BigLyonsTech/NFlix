package com.lyon.netflixclone.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public class ContentDtos {

    // Mirrors the frontend `Movie` interface exactly so the React app can
    // consume this response with zero mapping.
    public record ContentResponse(
            String id,
            String title,
            String thumbnailUrl,
            String backgroundUrl,
            String description,
            String year,
            String ageRating,
            String duration,
            String seasons,
            List<String> genres,
            Integer rating,
            Integer progress, // null unless returned in a per-user context (continue watching)
            String category
    ) {}

    public record ContentRequest(
            @NotBlank String title,
            String description,
            @NotBlank String thumbnailUrl,
            String backgroundUrl,
            String year,
            String ageRating,
            String duration,
            String seasons,
            List<String> genres,
            Integer rating,
            @NotBlank String category
    ) {}
}
