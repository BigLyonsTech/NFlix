package com.lyon.netflixclone.service;

import com.lyon.netflixclone.dto.ContentDtos.ContentRequest;
import com.lyon.netflixclone.dto.ContentDtos.ContentResponse;
import com.lyon.netflixclone.exception.ApiExceptions.NotFoundException;
import com.lyon.netflixclone.model.Content;
import com.lyon.netflixclone.repository.ContentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContentServiceTest {

    @Mock private ContentRepository contentRepository;

    @InjectMocks
    private ContentService contentService;

    private Content sampleContent() {
        return Content.builder()
                .id("content-1")
                .title("Breaking Bad")
                .thumbnailUrl("https://example.com/bb.jpg")
                .category(Content.ContentCategory.HERO)
                .genres(List.of("Crime", "Drama"))
                .build();
    }

    @Test
    void getAll_returnsAllContent_whenNoFilters() {
        when(contentRepository.findAll()).thenReturn(List.of(sampleContent()));

        List<ContentResponse> result = contentService.getAll(null, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).title()).isEqualTo("Breaking Bad");
    }

    @Test
    void getAll_searchesByTitle_whenSearchProvided() {
        when(contentRepository.findByTitleContainingIgnoreCase("breaking")).thenReturn(List.of(sampleContent()));

        List<ContentResponse> result = contentService.getAll("breaking", null);

        assertThat(result).hasSize(1);
        verify(contentRepository).findByTitleContainingIgnoreCase("breaking");
        verify(contentRepository, never()).findAll();
    }

    @Test
    void getById_throwsNotFound_whenMissing() {
        when(contentRepository.findById("missing-id")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> contentService.getById("missing-id"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void create_savesAndReturnsMappedContent() {
        ContentRequest request = new ContentRequest(
                "Dune", "A sci-fi epic", "https://example.com/dune.jpg", null,
                "2021", "U/A 13+", "2h 35m", null, List.of("Sci-Fi"), 5, "HERO"
        );

        when(contentRepository.save(any(Content.class))).thenAnswer(inv -> {
            Content c = inv.getArgument(0);
            c.setId("new-id");
            return c;
        });

        ContentResponse response = contentService.create(request);

        assertThat(response.id()).isEqualTo("new-id");
        assertThat(response.title()).isEqualTo("Dune");
        assertThat(response.category()).isEqualTo("HERO");
    }

    @Test
    void delete_throwsNotFound_whenContentMissing() {
        when(contentRepository.existsById("missing-id")).thenReturn(false);

        assertThatThrownBy(() -> contentService.delete("missing-id"))
                .isInstanceOf(NotFoundException.class);

        verify(contentRepository, never()).deleteById(any());
    }
}
