package com.c202.guestbook.service;

import com.c202.exception.types.*;
import com.c202.guestbook.entity.Guestbook;
import com.c202.guestbook.model.GuestbookDto;
import com.c202.guestbook.model.GuestbookPageResponse;
import com.c202.guestbook.repository.GuestbookRepository;
import com.c202.guestbook.utill.rabbitmq.AlarmService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GuestbookServiceImpl implements GuestbookService {
    private final WebClient.Builder webClientBuilder;
    private final GuestbookRepository guestbookRepository;
    private final AlarmService alarmService;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd HHmmss");

    @Override
    @Transactional
    public GuestbookDto createGuestbook(int ownerSeq, int writerSeq, GuestbookDto guestbookDTO) {
        if(ownerSeq == writerSeq){
            throw new BadRequestException("본인 방명록에는 작성할 수 없습니다.");
        }

        String currentTime = LocalDateTime.now().format(DATE_TIME_FORMATTER);

        Guestbook guestbook = Guestbook.builder()
                .ownerSeq(ownerSeq)
                .writerSeq(writerSeq)
                .content(guestbookDTO.getContent())
                .createdAt(currentTime)
                .updatedAt(currentTime)
                .isDeleted("N")
                .build();

        guestbook = guestbookRepository.save(guestbook);

        String nickname = webClientBuilder
                    .baseUrl("http://user-service")
                    .build()
                    .get()
                    .uri("/api/users/nickname")
                    .header("X-User-Seq", String.valueOf(writerSeq))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

        alarmService.sendGuestbookCreatedAlarm(
                guestbook.getOwnerSeq(),
                nickname,
                null
        );


        return GuestbookDto.builder()
                .guestbookSeq(guestbook.getGuestbookSeq())
                .ownerSeq(guestbook.getOwnerSeq())
                .writerSeq(guestbook.getWriterSeq())
                .content(guestbook.getContent())
                .createdAt(guestbook.getCreatedAt())
                .updatedAt(guestbook.getUpdatedAt())
                .deletedAt(guestbook.getDeletedAt())
                .isDeleted(guestbook.getIsDeleted())
                .build();

    }

    @Override
    public GuestbookPageResponse getAllGuestbooks(int ownerSeq, int page) {
        int size = 6;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Guestbook> guestbooks = guestbookRepository.findByOwnerSeqAndIsDeleted(ownerSeq, "N", pageable);

        List<Integer> writerSeqList = guestbooks.getContent().stream()
                .map(Guestbook::getWriterSeq)
                .distinct()
                .collect(Collectors.toList());

        Map<String, Object> response = webClientBuilder
                .baseUrl("http://user-service")
                .build()
                .post()
                .uri("/api/users/profiles")
                .bodyValue(writerSeqList)
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorMap(ex -> new WebClientCommunicationException("Web Client 통신 에러: " + ex.getMessage()))
                .block();

        List<Map<String, Object>> profiles = (List<Map<String, Object>>) response.get("data");

        Map<Integer, Map<String, Object>> profileMap = profiles.stream()
                .collect(Collectors.toMap(
                        p -> (Integer) p.get("userSeq"),
                        p -> p
                ));

        List<GuestbookDto> guestbookDtos = guestbooks.getContent().stream()
                .map(guestbook -> {
                    Map<String, Object> profile = profileMap.getOrDefault(guestbook.getWriterSeq(), null);
                    String nickname = profile != null ? (String) profile.getOrDefault("nickname", "알 수 없음") : "알 수 없음";
                    Integer iconSeq = profile != null ? (Integer) profile.getOrDefault("iconSeq", 0) : 0;

                    return GuestbookDto.builder()
                            .guestbookSeq(guestbook.getGuestbookSeq())
                            .ownerSeq(guestbook.getOwnerSeq())
                            .writerSeq(guestbook.getWriterSeq())
                            .writerNickname(nickname)
                            .writerIconSeq(iconSeq)
                            .content(guestbook.getContent())
                            .createdAt(guestbook.getCreatedAt())
                            .updatedAt(guestbook.getUpdatedAt())
                            .deletedAt(guestbook.getDeletedAt())
                            .isDeleted(guestbook.getIsDeleted())
                            .build();
                }).collect(Collectors.toList());

        return GuestbookPageResponse.builder()
                .guestbooks(guestbookDtos)
                .currentPage(page+1)
                .totalPages(guestbooks.getTotalPages())
                .totalElements(guestbooks.getTotalElements())
                .isLast(guestbooks.isLast())
                .build();
    }

    @Override
    @Transactional
    public void deleteGuestbook(int userSeq, int guestbookSeq) {
        // 1. 방명록이 없을 때
        Guestbook guestbook = guestbookRepository.findByGuestbookSeq(guestbookSeq)
                .orElseThrow(() -> new NotFoundException("해당 방명록을 찾을 수 없습니다."));

        // 2. 방명록이 이미 삭제된 상태인 경우
        if ("Y".equals(guestbook.getIsDeleted())) {
            throw new ConflictException("이미 삭제된 방명록입니다.");
        }

        // 3. userSeq와 방명록의 writerSeq가 다른 경우
        if (!guestbook.getWriterSeq().equals(userSeq)) {
            throw new UnauthorizedException("방명록 삭제 권한이 없습니다.");
        }

        // 4. 방명록 삭제
        guestbook.markAsDeleted();
        guestbook.setDeletedAt(LocalDateTime.now().format(DATE_TIME_FORMATTER));
        guestbookRepository.save(guestbook);
    }
}
