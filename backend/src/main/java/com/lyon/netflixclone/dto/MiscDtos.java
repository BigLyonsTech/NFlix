package com.lyon.netflixclone.dto;

import java.util.List;

public class MiscDtos {

    public record ProgressUpdateRequest(Integer progress) {}

    public record RecommendationResponse(
            List<ContentDtos.ContentResponse> recommendations,
            String reason
    ) {}

    public record ApiError(String message, int status) {}
}
