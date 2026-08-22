package com.musicology.guesser.config;

import java.nio.file.Path;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AppProperties properties;

    public WebConfig(AppProperties properties) {
        this.properties = properties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(properties.corsOrigins().toArray(String[]::new))
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*");
    }

    /**
     * Only the manuscripts directory is exposed. Case files live in a sibling directory and are
     * never reachable over HTTP, so answer data cannot be fetched by guessing a URL.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path manuscripts = Path.of(properties.dataDir(), "manuscripts").toAbsolutePath().normalize();
        registry.addResourceHandler("/media/**").addResourceLocations("file:" + manuscripts + "/");
    }
}
