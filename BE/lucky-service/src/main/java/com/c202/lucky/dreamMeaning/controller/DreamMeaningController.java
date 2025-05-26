package com.c202.lucky.dreamMeaning.controller;

import com.c202.dto.ResponseDto;
import com.c202.lucky.dreamMeaning.model.DreamMeaningDto;
import com.c202.lucky.dreamMeaning.model.DreamMeaningRequestDto;
import com.c202.lucky.dreamMeaning.service.DreamMeaningService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dream-meaning")
@RequiredArgsConstructor
@Validated
public class DreamMeaningController {

    private final DreamMeaningService dreamMeaningService;

    @PostMapping("/{diarySeq}")
    public ResponseEntity<ResponseDto<DreamMeaningDto >> generateDreamMeaning(
            @RequestHeader("X-User-Seq") @NotNull Integer userSeq,
            @PathVariable Integer diarySeq,
            @RequestBody DreamMeaningRequestDto dto) {
        DreamMeaningDto dreamMeaningDto = dreamMeaningService.createDreamMeaning(userSeq, diarySeq, dto);
        return ResponseEntity.status(201).body(ResponseDto.success(201, "꿈 해몽 생성 성공", dreamMeaningDto));
    }

    @GetMapping
    public ResponseEntity<ResponseDto<List<DreamMeaningDto>>> getDreamMeanings(
            @RequestHeader("X-User-Seq") @NotNull Integer userSeq) {
        return ResponseEntity.ok(ResponseDto.success(200, "꿈 해몽 전체 조회 성공", dreamMeaningService.getAllDreamMeanings(userSeq)));
    }

    @GetMapping("/{diarySeq}")
    public ResponseEntity<ResponseDto<DreamMeaningDto>> getDreamMeaning(
            @RequestHeader("X-User-Seq") @NotNull Integer userSeq,
            @PathVariable Integer diarySeq) {
        return ResponseEntity.ok(ResponseDto.success(200, "꿈 해몽 조회 성공", dreamMeaningService.getDreamMeaning(userSeq, diarySeq)));
    }

    // 삭제
    @DeleteMapping("/{diarySeq}")
    public ResponseEntity<ResponseDto<Void>> deleteDreamMeaning(
            @RequestHeader("X-User-Seq") @NotNull Integer userSeq,
            @PathVariable Integer diarySeq) {
        dreamMeaningService.deleteDreamMeaning(userSeq, diarySeq);
        return ResponseEntity.ok(ResponseDto.success(200, "꿈 해몽 삭제 성공"));
    }
}