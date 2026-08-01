package com.lyon.netflixclone.controller;

import com.lyon.netflixclone.dto.ContentDtos.ContentResponse;
import com.lyon.netflixclone.dto.MiscDtos.ProgressUpdateRequest;
import com.lyon.netflixclone.model.User;
import com.lyon.netflixclone.security.CurrentUserProvider;
import com.lyon.netflixclone.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/api/watchlist")
    public ResponseEntity<List<ContentResponse>> getWatchlist() {
        User user = currentUserProvider.require();
        return ResponseEntity.ok(watchlistService.getWatchlist(user.getId()));
    }

    @PostMapping("/api/watchlist/{contentId}")
    public ResponseEntity<Void> addToWatchlist(@PathVariable String contentId) {
        User user = currentUserProvider.require();
        watchlistService.addToWatchlist(user.getId(), contentId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/watchlist/{contentId}")
    public ResponseEntity<Void> removeFromWatchlist(@PathVariable String contentId) {
        User user = currentUserProvider.require();
        watchlistService.removeFromWatchlist(user.getId(), contentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/continue-watching")
    public ResponseEntity<List<ContentResponse>> getContinueWatching() {
        User user = currentUserProvider.require();
        return ResponseEntity.ok(watchlistService.getContinueWatching(user.getId()));
    }

    @PutMapping("/api/continue-watching/{contentId}")
    public ResponseEntity<Void> updateProgress(@PathVariable String contentId, @RequestBody ProgressUpdateRequest request) {
        User user = currentUserProvider.require();
        watchlistService.updateProgress(user.getId(), contentId, request.progress());
        return ResponseEntity.noContent().build();
    }
}
