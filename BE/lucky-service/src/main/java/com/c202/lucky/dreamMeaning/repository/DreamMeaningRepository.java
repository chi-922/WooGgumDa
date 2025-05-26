package com.c202.lucky.dreamMeaning.repository;

import com.c202.lucky.dreamMeaning.entity.DreamMeaning;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DreamMeaningRepository extends JpaRepository<DreamMeaning, Integer> {
    List<DreamMeaning> findByUserSeq(Integer userSeq);

    Optional<DreamMeaning> findByDiarySeq(Integer diarySeq);
}