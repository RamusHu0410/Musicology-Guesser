package com.musicology.guesser.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param dataDir      directory holding the content catalogue, relative to the working directory
 * @param mediaBaseUrl prefix applied to manuscript URLs handed to the frontend; empty yields
 *                     relative URLs
 * @param corsOrigins  browser origins allowed to call the API during local development
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(String dataDir, String mediaBaseUrl, List<String> corsOrigins) {
}
