package com.lyon.netflixclone.repository;

import com.lyon.netflixclone.model.Content;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ContentRepository extends MongoRepository<Content, String> {
    List<Content> findByCategory(Content.ContentCategory category);
    List<Content> findByTitleContainingIgnoreCase(String title);
    List<Content> findByIdIn(List<String> ids);
}
