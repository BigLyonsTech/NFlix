package com.lyon.netflixclone.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "content")
public class Content {

    @Id
    private String id;

    @Indexed
    private String title;

    private String description;

    private String thumbnailUrl;

    private String backgroundUrl;

    private String videoUrl;

    private String year;

    private String ageRating;

    private String duration;

    private String seasons;

    @Builder.Default
    private List<String> genres = List.of();

    private Integer rating; // 1-5 stars, used in the immersive view

    // Which home-page row this belongs to: NEW_TRAILER, POPCORN_MANIA, HERO
    private ContentCategory category;

    public enum ContentCategory {
        NEW_TRAILER, POPCORN_MANIA, HERO
    }
}
