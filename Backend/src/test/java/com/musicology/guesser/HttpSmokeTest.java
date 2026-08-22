package com.musicology.guesser;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/**
 * Exercises the API over a real HTTP connection rather than MockMvc, so serialization and static
 * media serving are covered too.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class HttpSmokeTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void referenceDataIsServedOverHttp() {
        ResponseEntity<String> composers = restTemplate.getForEntity("/api/composers", String.class);
        assertThat(composers.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(composers.getBody()).contains("\"id\":\"chopin-f\"", "\"era\":\"romantic\"");

        ResponseEntity<String> countries = restTemplate.getForEntity("/api/countries", String.class);
        assertThat(countries.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(countries.getBody()).contains("\"id\":\"austria\"", "\"lat\":48.2082");
    }

    @Test
    void excerptImagesAreServedAtTheAdvertisedUrl() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<String> game = restTemplate.postForEntity(
                "/api/game/start", new HttpEntity<>("{\"roundCount\":1}", headers), String.class);

        assertThat(game.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(game.getBody()).contains("/media/");

        ResponseEntity<byte[]> image = restTemplate.getForEntity("/media/case-017.png", byte[].class);
        assertThat(image.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(image.getHeaders().getContentType()).isEqualTo(MediaType.IMAGE_PNG);
        assertThat(image.getBody()).startsWith(new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47});
    }

    /** Only manuscripts are exposed; case files carry the answers and live outside that directory. */
    @Test
    void caseFilesAreNotReachableOverHttp() {
        for (String path : new String[] {"/media/case-017.json", "/data/cases/case-017.json", "/cases/case-017.json"}) {
            ResponseEntity<String> response = restTemplate.getForEntity(path, String.class);
            assertThat(response.getStatusCode()).as("%s must not be served", path).isEqualTo(HttpStatus.NOT_FOUND);
        }
    }

    @Test
    void unknownPathIsNotFoundRatherThanServerError() {
        ResponseEntity<String> response = restTemplate.getForEntity("/api/nope", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).contains("NOT_FOUND");
    }
}
