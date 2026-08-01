package com.lyon.netflixclone.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String fullName;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;

    @Builder.Default
    private Role role = Role.USER;

    // ids of Content the user has added to their watchlist
    @Builder.Default
    private Set<String> watchlist = new HashSet<>();

    // contentId -> progress percentage (0-100), backs "Continue Watching"
    @Builder.Default
    private java.util.Map<String, Integer> watchProgress = new java.util.HashMap<>();

    @Builder.Default
    private Instant createdAt = Instant.now();

    public enum Role {
        USER, ADMIN
    }
}
