package com.musicology.guesser;

import static org.hamcrest.Matchers.greaterThan;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ReferenceDataApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listsComposersWithEra() throws Exception {
        mockMvc.perform(get("/api/composers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThan(0)))
                .andExpect(jsonPath("$[?(@.id == 'chopin-f')].name").value("Frédéric Chopin"))
                .andExpect(jsonPath("$[?(@.id == 'chopin-f')].era").value("romantic"));
    }

    /** Cities carry coordinates so the frontend can put them on a map. */
    @Test
    void listsCitiesWithCoordinates() throws Exception {
        mockMvc.perform(get("/api/cities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == 'vienna')].name").value("Vienna"))
                .andExpect(jsonPath("$[?(@.id == 'vienna')].country").value("Austria"))
                .andExpect(jsonPath("$[?(@.id == 'vienna')].lat").value(48.2082))
                .andExpect(jsonPath("$[?(@.id == 'vienna')].lon").value(16.3738));
    }

    @Test
    void listsInstrumentationCategories() throws Exception {
        mockMvc.perform(get("/api/instrumentation-categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == 'solo-piano')].name").value("Solo Piano"));
    }
}
