package com.musicology.guesser.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.musicology.guesser.dto.CityDto;
import com.musicology.guesser.dto.ComposerDto;
import com.musicology.guesser.dto.ReferenceItemDto;
import com.musicology.guesser.model.City;
import com.musicology.guesser.model.Composer;
import com.musicology.guesser.model.ReferenceItem;
import com.musicology.guesser.repository.ContentRepository;

@Service
public class ReferenceDataService {

    private final ContentRepository content;

    public ReferenceDataService(ContentRepository content) {
        this.content = content;
    }

    public List<ComposerDto> listComposers() {
        return content.findAllComposers().stream()
                .sorted(Comparator.comparing(Composer::name))
                .map(composer -> new ComposerDto(composer.id(), composer.name(), composer.era()))
                .toList();
    }

    public List<CityDto> listCities() {
        return content.findAllCities().stream()
                .sorted(Comparator.comparing(City::name))
                .map(city -> new CityDto(city.id(), city.name(), city.country(), city.lat(), city.lon()))
                .toList();
    }

    public List<ReferenceItemDto> listInstrumentationCategories() {
        return content.findAllInstrumentationCategories().stream()
                .sorted(Comparator.comparing(ReferenceItem::name))
                .map(item -> new ReferenceItemDto(item.id(), item.name()))
                .toList();
    }
}
