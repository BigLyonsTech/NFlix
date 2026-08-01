package com.lyon.netflixclone.controller;

import com.lyon.netflixclone.dto.ContentDtos.ContentRequest;
import com.lyon.netflixclone.dto.ContentDtos.ContentResponse;
import com.lyon.netflixclone.service.ContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/content")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @GetMapping
    public ResponseEntity<List<ContentResponse>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(contentService.getAll(search, category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(contentService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ContentResponse> create(@Valid @RequestBody ContentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contentService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContentResponse> update(@PathVariable String id, @Valid @RequestBody ContentRequest request) {
        return ResponseEntity.ok(contentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        contentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
