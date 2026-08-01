package com.lyon.netflixclone.service;

import com.lyon.netflixclone.dto.ContentDtos.ContentResponse;
import com.lyon.netflixclone.exception.ApiExceptions.NotFoundException;
import com.lyon.netflixclone.model.Content;
import com.lyon.netflixclone.model.User;
import com.lyon.netflixclone.repository.ContentRepository;
import com.lyon.netflixclone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final UserRepository userRepository;
    private final ContentRepository contentRepository;

    public List<ContentResponse> getWatchlist(String userId) {
        User user = getUser(userId);
        List<Content> items = contentRepository.findByIdIn(List.copyOf(user.getWatchlist()));
        return items.stream().map(c -> ContentService.toResponse(c, null)).toList();
    }

    public void addToWatchlist(String userId, String contentId) {
        User user = getUser(userId);
        if (!contentRepository.existsById(contentId)) {
            throw new NotFoundException("Content not found: " + contentId);
        }
        user.getWatchlist().add(contentId);
        userRepository.save(user);
    }

    public void removeFromWatchlist(String userId, String contentId) {
        User user = getUser(userId);
        user.getWatchlist().remove(contentId);
        userRepository.save(user);
    }

    public List<ContentResponse> getContinueWatching(String userId) {
        User user = getUser(userId);
        List<String> ids = List.copyOf(user.getWatchProgress().keySet());
        List<Content> items = contentRepository.findByIdIn(ids);

        return items.stream()
                .map(c -> ContentService.toResponse(c, user.getWatchProgress().get(c.getId())))
                .toList();
    }

    public void updateProgress(String userId, String contentId, int progress) {
        User user = getUser(userId);
        if (!contentRepository.existsById(contentId)) {
            throw new NotFoundException("Content not found: " + contentId);
        }
        user.getWatchProgress().put(contentId, Math.max(0, Math.min(100, progress)));
        userRepository.save(user);
    }

    private User getUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
    }
}
