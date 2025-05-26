package com.c202.user.elastic.controller;

import com.c202.user.elastic.model.request.UserSearchRequestDto;
import com.c202.user.elastic.model.response.PageResponseDto;
import com.c202.user.elastic.model.response.UserSearchResponseDto;
import com.c202.user.elastic.service.UserSearchService;
import com.c202.dto.ResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class UserSearchController {

    private final UserSearchService userSearchService;

    @GetMapping("/users/search")
    public ResponseEntity<ResponseDto<PageResponseDto<UserSearchResponseDto>>> searchUsers(
            @ModelAttribute UserSearchRequestDto requestDto) {
        log.info("User search request: {}", requestDto);
        Page<UserSearchResponseDto> results = userSearchService.searchUsers(requestDto);
        PageResponseDto<UserSearchResponseDto> pageResponse = PageResponseDto.from(results);
        return ResponseEntity.ok(ResponseDto.success(200, "사용자 검색 완료", pageResponse));
    }
}