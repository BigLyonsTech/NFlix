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

    // Real, full-length Creative Commons films (Blender Foundation open movies,
    // served from archive.org) - cycled across titles so the player has actual
    // long-form video instead of a static thumbnail or a few-second clip.
    private static final String VIDEO_BIG_BUCK_BUNNY = "https://archive.org/download/BigBuckBunny_328/BigBuckBunny_512kb.mp4";
    private static final String VIDEO_ELEPHANTS_DREAM = "https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4";
    private static final String VIDEO_SINTEL = "https://archive.org/download/Sintel/sintel-2048-stereo_512kb.mp4";

    private void seedContent() {
        if (contentRepository.count() > 0) return;

        List<Content> seed = List.of(
                Content.builder().title("Shadow and Bone")
                        .description("A war orphan discovers she wields a rare power that could unite her fractured kingdom — or destroy it.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80")
                        .videoUrl(VIDEO_BIG_BUCK_BUNNY)
                        .category(ContentCategory.NEW_TRAILER).genres(List.of("Fantasy", "Drama")).build(),
                Content.builder().title("The Night Agent")
                        .description("A low-level FBI agent monitors a secret phone that only rings when an operative is in mortal danger.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=300&q=80")
                        .videoUrl(VIDEO_ELEPHANTS_DREAM)
                        .category(ContentCategory.NEW_TRAILER).genres(List.of("Thriller")).build(),
                Content.builder().title("The Witcher")
                        .description("A solitary monster hunter struggles to find his place in a world where people often prove more wicked than beasts.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=300&q=80")
                        .videoUrl(VIDEO_SINTEL)
                        .category(ContentCategory.NEW_TRAILER).genres(List.of("Fantasy", "Action")).build(),

                Content.builder().title("Brooklyn Nine-Nine").year("2020").ageRating("U/A 16+").seasons("7 Seasons")
                        .description("A wisecracking NYPD detective and his oddball squad navigate crime, paperwork, and each other.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=500&q=80")
                        .videoUrl(VIDEO_BIG_BUCK_BUNNY)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Comedy")).build(),
                Content.builder().title("Ready Player One").year("2018").ageRating("U/A 13+").duration("2h 20m")
                        .description("In a bleak future, a teenager escapes into a vast virtual universe to solve a puzzle worth a fortune.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=80")
                        .videoUrl(VIDEO_ELEPHANTS_DREAM)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Sci-Fi", "Adventure")).build(),
                Content.builder().title("Money Heist").year("2021").ageRating("A").duration("2h 20m")
                        .description("A criminal mastermind assembles a team of specialists to pull off the biggest heist in recorded history.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1627856013091-fed6e4e048c5?auto=format&fit=crop&w=500&q=80")
                        .videoUrl(VIDEO_SINTEL)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Crime", "Thriller")).build(),
                Content.builder().title("Ash vs. Evil Dead").year("2018").ageRating("A").seasons("3 Seasons")
                        .description("A reluctant hero grabs his chainsaw hand and boomstick to fight back an army of the undead.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1505635552518-3448ff116af3?auto=format&fit=crop&w=500&q=80")
                        .videoUrl(VIDEO_BIG_BUCK_BUNNY)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Horror", "Comedy")).build(),

                Content.builder().title("Peaky Blinders").year("2013").seasons("6 Seasons").ageRating("A")
                        .description("A fierce crime family clashes for control of a post-war city, one ruthless deal at a time.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=1200&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_ELEPHANTS_DREAM)
                        .category(ContentCategory.HERO).genres(List.of("Crime", "Drama")).rating(5).build(),
                Content.builder().title("Stranger Things").year("2016").seasons("4 Seasons").ageRating("U/A")
                        .description("A small town uncovers a government conspiracy, supernatural forces, and a girl with extraordinary abilities.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1614145266184-a1599a0edb88?auto=format&fit=crop&w=1200&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1614145266184-a1599a0edb88?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_SINTEL)
                        .category(ContentCategory.HERO).genres(List.of("Sci-Fi", "Horror")).rating(5).build(),
                Content.builder().title("Breaking Bad").year("2008").seasons("5 Seasons").ageRating("A")
                        .description("A chemistry teacher turned drug kingpin discovers how far he'll go to protect what he's built.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1574347710313-8b7466eb4b12?auto=format&fit=crop&w=1200&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1574347710313-8b7466eb4b12?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_BIG_BUCK_BUNNY)
                        .category(ContentCategory.HERO).genres(List.of("Crime", "Drama")).rating(5).build(),

                Content.builder().title("Extraction").year("2020").ageRating("A").duration("1h 56m")
                        .description("A black-market mercenary is hired for a deadly extraction mission that spirals into a one-way fight for survival.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_BIG_BUCK_BUNNY)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Action", "Thriller")).rating(4).build(),
                Content.builder().title("John Wick: Chapter 4").year("2023").ageRating("A").duration("2h 49m")
                        .description("An assassin fights his way across the globe to earn his freedom from a merciless crime syndicate.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_ELEPHANTS_DREAM)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Action", "Crime")).rating(5).build(),
                Content.builder().title("The Old Guard").year("2020").ageRating("U/A 16+").duration("2h 5m")
                        .description("A team of centuries-old immortal mercenaries is exposed and must fight to protect their secret.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_SINTEL)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Action", "Fantasy")).rating(4).build(),
                Content.builder().title("6 Underground").year("2019").ageRating("A").duration("2h 8m")
                        .description("A team of vigilantes fakes their own deaths to take down the world's worst dictators, off the grid.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1517602302552-471fe67acf66?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_BIG_BUCK_BUNNY)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Action", "Thriller")).rating(3).build(),
                Content.builder().title("The Mandalorian").year("2019").ageRating("U/A 13+").seasons("3 Seasons")
                        .description("A lone bounty hunter treks through the outer reaches of the galaxy, far from the authority of any New Republic.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1520869562399-e772f042f422?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1520869562399-e772f042f422?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_ELEPHANTS_DREAM)
                        .category(ContentCategory.HERO).genres(List.of("Action", "Sci-Fi", "Adventure")).rating(5).build(),
                Content.builder().title("Arcane").year("2021").ageRating("U/A 16+").seasons("2 Seasons")
                        .description("Two sister cities on the brink of technological revolution are torn apart, forcing unlikely heroes into a fight for their future.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_SINTEL)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Animation", "Action", "Fantasy")).rating(5).build(),
                Content.builder().title("The Office").year("2005").ageRating("U/A 13+").seasons("9 Seasons")
                        .description("A hapless paper company staff navigates workplace absurdity, one mockumentary interview at a time.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_BIG_BUCK_BUNNY)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Comedy")).rating(5).build(),
                Content.builder().title("Never Have I Ever").year("2020").ageRating("U/A 13+").seasons("4 Seasons")
                        .description("A first-generation Indian American teenager tries to reinvent her social status while grieving her father.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_ELEPHANTS_DREAM)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Comedy", "Drama")).rating(4).build(),
                Content.builder().title("Big Mouth").year("2017").ageRating("A").seasons("7 Seasons")
                        .description("A group of middle schoolers stumble through the chaos of puberty, guided (badly) by their own personal hormone monsters.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1521133573892-e44906baee46?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1521133573892-e44906baee46?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_SINTEL)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Animation", "Comedy")).rating(4).build(),
                Content.builder().title("The Crown").year("2016").ageRating("U/A 13+").seasons("6 Seasons")
                        .description("The reign of a young queen unfolds against a backdrop of family duty, political intrigue, and a changing nation.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_BIG_BUCK_BUNNY)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Drama")).rating(5).build(),
                Content.builder().title("Ozark").year("2017").ageRating("A").seasons("4 Seasons")
                        .description("A financial planner relocates his family to the Ozarks after a money-laundering scheme goes catastrophically wrong.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_ELEPHANTS_DREAM)
                        .category(ContentCategory.HERO).genres(List.of("Drama", "Crime", "Thriller")).rating(5).build(),
                Content.builder().title("Black Mirror").year("2011").ageRating("A").seasons("6 Seasons")
                        .description("Standalone stories examine a twisted, high-tech near future where every innovation carries a dark cost.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_SINTEL)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Sci-Fi", "Drama")).rating(5).build(),
                Content.builder().title("The Haunting of Hill House").year("2018").ageRating("A").seasons("1 Season")
                        .description("A family confronts the childhood trauma that drove them from a house that never let them go.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1533669955142-6a73332af4db?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1533669955142-6a73332af4db?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_BIG_BUCK_BUNNY)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Horror", "Drama")).rating(5).build(),
                Content.builder().title("Mindhunter").year("2017").ageRating("A").seasons("2 Seasons")
                        .description("Two FBI agents pioneer criminal profiling by interviewing incarcerated serial killers to understand how they think.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_ELEPHANTS_DREAM)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Thriller", "Crime")).rating(4).build(),
                Content.builder().title("Narcos").year("2015").ageRating("A").seasons("3 Seasons")
                        .description("The rise and fall of the world's most powerful cocaine cartels, told from both sides of the drug war.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_SINTEL)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Crime", "Drama")).rating(5).build(),
                Content.builder().title("Bridgerton").year("2020").ageRating("A").seasons("3 Seasons")
                        .description("In Regency-era London, eight siblings navigate high society, scandal, and the pursuit of love.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1547700055-b61cacebece9?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1547700055-b61cacebece9?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_BIG_BUCK_BUNNY)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Romance", "Drama")).rating(4).build(),
                Content.builder().title("Our Planet").year("2019").ageRating("U/A").seasons("1 Season")
                        .description("A sweeping documentary exploring the planet's last wild places and the fragile systems that sustain them.")
                        .thumbnailUrl("https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=500&q=80")
                        .backgroundUrl("https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=1920&q=80")
                        .videoUrl(VIDEO_ELEPHANTS_DREAM)
                        .category(ContentCategory.POPCORN_MANIA).genres(List.of("Documentary")).rating(5).build()
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
