package com.c202.guestbook.controller;
import com.c202.dto.ResponseDto;
import com.c202.guestbook.model.GuestbookPageResponse;
import jakarta.validation.constraints.NotNull;
import com.c202.guestbook.model.GuestbookDto;
import com.c202.guestbook.service.GuestbookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/api/guestbook")
public class GuestbookController {

    private final GuestbookService guestbookService;

    @GetMapping("/me")
    public ResponseEntity<ResponseDto<GuestbookPageResponse>> getMyGuestbooks(
            @RequestHeader("X-User-Seq") @NotNull Integer userSeq,
            @RequestParam(defaultValue = "1") int page) {

        GuestbookPageResponse guestbooks = guestbookService.getAllGuestbooks(userSeq, page-1);
        return ResponseEntity.ok(ResponseDto.success(200, "내 방명록 조회 성공", guestbooks));
    }

    @GetMapping("/users/{userSeq}")
    public ResponseEntity<ResponseDto<GuestbookPageResponse>> getUserGuestbooks(
            @PathVariable Integer userSeq,
            @RequestParam(defaultValue = "1") int page) {

        GuestbookPageResponse guestbooks = guestbookService.getAllGuestbooks(userSeq, page-1);
        return ResponseEntity.ok(ResponseDto.success(200, "타인 방명록 조회 성공", guestbooks));
    }

    @PostMapping("/users/{ownerSeq}")
    public ResponseEntity<ResponseDto<Object>> createGuestbook(@RequestHeader("X-User-Seq") @NotNull Integer writerSeq, @PathVariable Integer ownerSeq, @RequestBody GuestbookDto guestbookDto){
        GuestbookDto createdGuestbook = guestbookService.createGuestbook(ownerSeq, writerSeq, guestbookDto);
        return ResponseEntity.status(201).body(ResponseDto.success(201, "방명록 작성 완료", createdGuestbook));
    }

    @DeleteMapping("/{guestbookSeq}")
    public ResponseEntity<ResponseDto<Object>> deleteGuestbook(
            @RequestHeader("X-User-Seq") Integer userSeq, @PathVariable Integer guestbookSeq) {
        guestbookService.deleteGuestbook(userSeq, guestbookSeq);
        return ResponseEntity.ok(ResponseDto.success(200, "방명록 삭제 완료"));
    }
}