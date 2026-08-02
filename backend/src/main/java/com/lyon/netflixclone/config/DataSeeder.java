package com.lyon.netflixclone.config;

import com.lyon.netflixclone.model.Content;
import com.lyon.netflixclone.model.Content.ContentCategory;
import com.lyon.netflixclone.model.User;
import com.lyon.netflixclone.repository.ContentRepository;
import com.lyon.netflixclone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ContentRepository contentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedContent();
        seedAdmin();
    }

    // Real, freely-licensed (CC0) sample clips - cycled across titles so the
    // player has actual video to show instead of a static thumbnail.
    private static final String VIDEO_FLOWER = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
    private static final String VIDEO_FRIDAY = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4";
    private static final String VIDEO_BUNNY = "https://www.w3schools.com/html/mov_bbb.mp4";

    private void seedContent() {
        if (contentRepository.count() > 0) return;

        List<Content> seed = List.of(
                Content.builder().title("Shadow and Bone")
                        .thumbnailUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80")
                        .videoUrl(VIDEO_FLOWER)
                        .category(ContentCategory.NEW_TRAILER).genres(List.of("Fantasy", "Drama")).build(),
                Content.builder().title("The Night Agent")
                        .thumbnailUrl("https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=300&q=80")
                        .videoUrl(VIDEO_FRIDAY)
                        .category(ContentCategory.NEW_TRAILER).genres(List.of("Thriller")).build(),
                Content.builder().title("The Witcher")
                        .thumbnailUrl("https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=300&q=80")
                        .videoUrl(VIDEO_BUNNY)
                        .category(ContentCategory.NEW_TRAILER).genres(List.of("Fantasy", "Action")).build(),

                Content.builder().title("Brooklyn Nine-Nine").year("2020").ageRating("U/A 16+").seasons("7 Seasons")
                        .thumbnailUrl("https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=500&q=80")
                        .videoUrl(VIDEO_FLOWER)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Comedy")).build(),
                Content.builder().title("Ready Player One").year("2018").ageRating("U/A 13+").duration("2h 20m")
                        .thumbnailUrl("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80")
                        .videoUrl(VIDEO_FRIDAY)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Sci-Fi", "Adventure")).build(),
                Content.builder().title("Money Heist").year("2021").ageRating("A").duration("2h 20m")
                        .thumbnailUrl("https://images.unsplash.com/photo-1627856013091-fed6e4e048c5?auto=format&fit=crop&w=500&q=80")
                        .videoUrl(VIDEO_BUNNY)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Crime", "Thriller")).build(),
                Content.builder().title("Ash vs. Evil Dead").year("2018").ageRating("A").seasons("3 Seasons")
                        .thumbnailUrl("https://images.unsplash.com/photo-1505635552518-3448ff116af3?auto=format&fit=crop&w=500&q=80")
                        .videoUrl(VIDEO_FLOWER)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Horror", "Comedy")).build(),

                Content.builder().title("Peaky Blinders").year("2013").seasons("6 Seasons").ageRating("A")
                        .thumbnailUrl("https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=1200&q=80")
                        .videoUrl(VIDEO_FRIDAY)
                        .category(ContentCategory.HERO).genres(List.of("Crime", "Drama")).rating(5).build(),
                Content.builder().title("Stranger Things").year("2016").seasons("4 Seasons").ageRating("U/A")
                        .thumbnailUrl("https://images.unsplash.com/photo-1614145266184-a1599a0edb88?auto=format&fit=crop&w=1200&q=80")
                        .videoUrl(VIDEO_BUNNY)
                        .category(ContentCategory.HERO).genres(List.of("Sci-Fi", "Horror")).rating(5).build(),
                Content.builder().title("Breaking Bad").year("2008").seasons("5 Seasons").ageRating("A")
                        .thumbnailUrl("https://images.unsplash.com/photo-1574347710313-8b7466eb4b12?auto=format&fit=crop&w=1200&q=80")
                        .videoUrl(VIDEO_FLOWER)
                        .category(ContentCategory.HERO).genres(List.of("Crime", "Drama")).rating(5).build()
        );

        contentRepository.saveAll(seed);
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail("admin@netflixclone.com")) return;

        User admin = User.builder()
                .fullName("Admin")
                .email("admin@netflixclone.com")
                .passwordHash(passwordEncoder.encode("Admin123!"))
                .role(User.Role.ADMIN)
                .build();

        userRepository.save(admin);
    }
}
