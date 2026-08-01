package com.lyon.netflixclone.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil("test-secret-key-for-junit-tests-only-min-32-chars", 3600000);
    }

    @Test
    void generateToken_thenExtractUserId_roundTrips() {
        String token = jwtUtil.generateToken("user-123", "lyon@example.com");

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.extractUserId(token)).isEqualTo("user-123");
        assertThat(jwtUtil.isTokenValid(token)).isTrue();
    }

    @Test
    void isTokenValid_returnsFalse_forGarbageToken() {
        assertThat(jwtUtil.isTokenValid("not-a-real-token")).isFalse();
    }

    @Test
    void isTokenValid_returnsFalse_forExpiredToken() {
        JwtUtil shortLivedUtil = new JwtUtil("test-secret-key-for-junit-tests-only-min-32-chars", -1000);
        String expiredToken = shortLivedUtil.generateToken("user-123", "lyon@example.com");

        assertThat(shortLivedUtil.isTokenValid(expiredToken)).isFalse();
    }
}
