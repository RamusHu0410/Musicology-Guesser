package com.musicology.guesser.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.musicology.guesser.dto.ComposerDto;
import com.musicology.guesser.dto.CountryDto;
import com.musicology.guesser.dto.ReferenceItemDto;
import com.musicology.guesser.service.ReferenceDataService;

@RestController
@RequestMapping("/api")
public class ReferenceDataController {

    private final ReferenceDataService referenceDataService;

    public ReferenceDataController(ReferenceDataService referenceDataService) {
        this.referenceDataService = referenceDataService;
    }

    @GetMapping("/composers")
    public List<ComposerDto> composers() {
        return referenceDataService.listComposers();
    }

    @GetMapping("/countries")
    public List<CountryDto> countries() {
        return referenceDataService.listCountries();
    }

    @GetMapping("/instrumentation-categories")
    public List<ReferenceItemDto> instrumentationCategories() {
        return referenceDataService.listInstrumentationCategories();
    }
}
