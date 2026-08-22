package com.musicology.guesser;

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Deployment leans entirely on environment overrides, and the manuscript URLs handed to the
 * frontend are absolute. This pins both to non-localhost values so a deploy does not discover at
 * demo time that it is still advertising {@code http://localhost:8080}.
 */
@SpringBootTest(
        properties = {
            "app.media-base-url=https://cdn.example.org",
            "app.cors-origins=https://musicology.example.org"
        })
@AutoConfigureMockMvc
class DeploymentConfigTest {

    private static final String DEPLOYED_ORIGIN = "https://musicology.example.org";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void manuscriptUrlsUseTheConfiguredBase() throws Exception {
        mockMvc.perform(post("/api/game/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roundCount\":1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rounds[0].imageUrl").value(startsWith("https://cdn.example.org/media/")));
    }

    @Test
    void theConfiguredOriginMayCallTheApi() throws Exception {
        mockMvc.perform(options("/api/composers")
                        .header("Origin", DEPLOYED_ORIGIN)
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", DEPLOYED_ORIGIN));
    }

    @Test
    void otherOriginsAreRefused() throws Exception {
        mockMvc.perform(options("/api/composers")
                        .header("Origin", "https://not-our-frontend.example.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }

    @Test
    void healthReportsTheLoadedCatalogue() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.cases").isNumber())
                .andExpect(jsonPath("$.activeSessions").isNumber());
    }
}
