package com.musicology.guesser;

import java.time.Clock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

import com.musicology.guesser.config.AppProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class MusicologyGuesserApplication {

    public static void main(String[] args) {
        SpringApplication.run(MusicologyGuesserApplication.class, args);
    }

    /** Injected rather than called statically so session expiry can be tested without sleeping. */
    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}
