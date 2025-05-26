package com.c202.lucky.dailyFortune.controller;

import com.c202.lucky.dailyFortune.service.DailyFortuneService;
import com.c202.dto.ResponseDto;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/daily-fortune")
@RequiredArgsConstructor
@Validated
public class DailyFortuneController {

    private final DailyFortuneService dailyFortuneService;

    @PostMapping
    public ResponseEntity<ResponseDto<String>> generateDailyFortune (@RequestHeader("X-User-Seq") @NotNull Integer userSeq){
        dailyFortuneService.createDailyFortune(userSeq);
        return ResponseEntity.status(201).body(ResponseDto.success(201, "오늘의 운세 생성 성공"));
    }

    @GetMapping
    public ResponseEntity<ResponseDto<String>> getDailyFortune (@RequestHeader("X-User-Seq") @NotNull Integer userSeq){
        return ResponseEntity.ok(ResponseDto.success(200, "오늘의 운세 조회 성공", dailyFortuneService.getDailyFortune(userSeq)));
    }
}
