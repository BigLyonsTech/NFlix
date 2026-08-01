package com.lyon.netflixclone.service;

import com.lyon.netflixclone.exception.ApiExceptions.NotFoundException;
import com.lyon.netflixclone.model.Content;
import com.lyon.netflixclone.model.User;
import com.lyon.netflixclone.repository.ContentRepository;
import com.lyon.netflixclone.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WatchlistServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private ContentRepository contentRepository;

    @InjectMocks
    private WatchlistService watchlistService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id("user-1")
                .email("lyon@example.com")
                .watchlist(new HashSet<>())
                .watchProgress(new HashMap<>())
                .build();
    }

    @Test
    void addToWatchlist_addsContentId_whenContentExists() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(contentRepository.existsById("content-1")).thenReturn(true);

        watchlistService.addToWatchlist("user-1", "content-1");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getWatchlist()).contains("content-1");
    }

    @Test
    void addToWatchlist_throwsNotFound_whenContentMissing() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(contentRepository.existsById("missing")).thenReturn(false);

        assertThatThrownBy(() -> watchlistService.addToWatchlist("user-1", "missing"))
                .isInstanceOf(NotFoundException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void updateProgress_clampsValueBetweenZeroAndHundred() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(contentRepository.existsById("content-1")).thenReturn(true);

        watchlistService.updateProgress("user-1", "content-1", 150);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getWatchProgress().get("content-1")).isEqualTo(100);
    }

    @Test
    void getWatchlist_returnsEmptyList_whenUserHasNoItems() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(contentRepository.findByIdIn(List.of())).thenReturn(List.of());

        var result = watchlistService.getWatchlist("user-1");

        assertThat(result).isEmpty();
    }

    @Test
    void removeFromWatchlist_throwsNotFound_whenUserMissing() {
        when(userRepository.findById("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> watchlistService.removeFromWatchlist("ghost", "content-1"))
                .isInstanceOf(NotFoundException.class);
    }
}
