package com.musicology.guesser;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.musicology.guesser.config.AppProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class MusicologyGuesserApplication {

    public static void main(String[] args) {
        SpringApplication.run(MusicologyGuesserApplication.class, args);
    }
}
