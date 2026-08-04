package com.lyon.netflixclone.exception;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression test for the GlobalExceptionHandler fix: invalid input must map
 * to a clean 400 with a generic message, never a 500 leaking exception
 * internals (e.g. the raw "No enum constant ...ContentCategory.BOGUS" text).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GlobalExceptionHandlerIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @Test
    void invalidCategoryParam_returnsCleanBadRequest_notLeakedServerError() throws Exception {
        mockMvc.perform(get("/api/content").param("category", "BOGUS"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid request parameters."))
                .andExpect(jsonPath("$.message", org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("ContentCategory"))));
    }
}
