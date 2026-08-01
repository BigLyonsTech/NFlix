package com.lyon.netflixclone.service;

import com.lyon.netflixclone.dto.ContentDtos.ContentRequest;
import com.lyon.netflixclone.dto.ContentDtos.ContentResponse;
import com.lyon.netflixclone.exception.ApiExceptions.NotFoundException;
import com.lyon.netflixclone.model.Content;
import com.lyon.netflixclone.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final ContentRepository contentRepository;

    public List<ContentResponse> getAll(String search, String category) {
        List<Content> results;

        if (search != null && !search.isBlank()) {
            results = contentRepository.findByTitleContainingIgnoreCase(search);
        } else if (category != null && !category.isBlank()) {
            results = contentRepository.findByCategory(Content.ContentCategory.valueOf(category.toUpperCase()));
        } else {
            results = contentRepository.findAll();
        }

        return results.stream().map(c -> toResponse(c, null)).toList();
    }

    public ContentResponse getById(String id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Content not found: " + id));
        return toResponse(content, null);
    }

    public List<Content> getByIds(List<String> ids) {
        return contentRepository.findByIdIn(ids);
    }

    public ContentResponse create(ContentRequest request) {
        Content content = Content.builder()
                .title(request.title())
                .description(request.description())
                .thumbnailUrl(request.thumbnailUrl())
                .backgroundUrl(request.backgroundUrl())
                .year(request.year())
                .ageRating(request.ageRating())
                .duration(request.duration())
                .seasons(request.seasons())
                .genres(request.genres())
                .rating(request.rating())
                .category(Content.ContentCategory.valueOf(request.category().toUpperCase()))
                .build();

        return toResponse(contentRepository.save(content), null);
    }

    public ContentResponse update(String id, ContentRequest request) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Content not found: " + id));

        content.setTitle(request.title());
        content.setDescription(request.description());
        content.setThumbnailUrl(request.thumbnailUrl());
        content.setBackgroundUrl(request.backgroundUrl());
        content.setYear(request.year());
        content.setAgeRating(request.ageRating());
        content.setDuration(request.duration());
        content.setSeasons(request.seasons());
        content.setGenres(request.genres());
        content.setRating(request.rating());
        content.setCategory(Content.ContentCategory.valueOf(request.category().toUpperCase()));

        return toResponse(contentRepository.save(content), null);
    }

    public void delete(String id) {
        if (!contentRepository.existsById(id)) {
            throw new NotFoundException("Content not found: " + id);
        }
        contentRepository.deleteById(id);
    }

    public static ContentResponse toResponse(Content c, Integer progress) {
        return new ContentResponse(
                c.getId(),
                c.getTitle(),
                c.getThumbnailUrl(),
                c.getBackgroundUrl(),
                c.getDescription(),
                c.getYear(),
                c.getAgeRating(),
                c.getDuration(),
                c.getSeasons(),
                c.getGenres(),
                c.getRating(),
                progress,
                c.getCategory() != null ? c.getCategory().name() : null
        );
    }
}
