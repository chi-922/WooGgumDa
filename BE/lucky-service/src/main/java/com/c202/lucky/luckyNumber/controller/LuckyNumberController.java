package com.c202.lucky.luckyNumber.controller;

import com.c202.dto.ResponseDto;
import com.c202.lucky.luckyNumber.service.LuckyNumberService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lucky-numbers")
@RequiredArgsConstructor
@Validated
public class LuckyNumberController {

    private final LuckyNumberService luckyNumberService;

    @PostMapping
    public ResponseEntity<ResponseDto<Void>> generateLuckyNumber(@RequestHeader("X-User-Seq") @NotNull Integer userSeq){
        luckyNumberService.createLuckyNumber(userSeq);
        return ResponseEntity.status(201).body(ResponseDto.success(201, "행운 번호 생성 성공"));
    }

    @GetMapping
    public ResponseEntity<ResponseDto<List<Integer>>> getLuckyNumbers(@RequestHeader("X-User-Seq") @NotNull Integer userSeq){
        return ResponseEntity.ok(ResponseDto.success(200,"행운 번호 조회 성공", luckyNumberService.getLuckyNumber(userSeq)));
    }
}
