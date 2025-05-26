package com.c202.lucky.dreamMeaning.service;

import com.c202.lucky.dreamMeaning.model.DreamMeaningDto;
import com.c202.lucky.dreamMeaning.model.DreamMeaningRequestDto;

import java.util.List;

public interface DreamMeaningService {
    DreamMeaningDto createDreamMeaning(Integer userSeq, Integer diarySeq, DreamMeaningRequestDto dto);
    List<DreamMeaningDto> getAllDreamMeanings(Integer userSeq);
    DreamMeaningDto getDreamMeaning(Integer userSeq, Integer diarySeq);
    void deleteDreamMeaning(Integer userSeq, Integer diarySeq);
}
