package com.lyon.netflixclone.controller;

import com.lyon.netflixclone.dto.MiscDtos.RecommendationResponse;
import com.lyon.netflixclone.model.User;
import com.lyon.netflixclone.security.CurrentUserProvider;
import com.lyon.netflixclone.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<RecommendationResponse> getRecommendations() {
        User user = currentUserProvider.require();
        return ResponseEntity.ok(recommendationService.recommendFor(user.getId()));
    }
}
