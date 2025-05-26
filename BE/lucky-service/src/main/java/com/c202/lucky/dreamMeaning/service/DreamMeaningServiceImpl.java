package com.c202.lucky.dreamMeaning.service;

import com.c202.exception.types.*;
import com.c202.lucky.dreamMeaning.entity.DreamMeaning;
import com.c202.lucky.dreamMeaning.model.DreamMeaningDto;
import com.c202.lucky.dreamMeaning.model.DreamMeaningRequestDto;
import com.c202.lucky.dreamMeaning.repository.DreamMeaningRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DreamMeaningServiceImpl implements DreamMeaningService {
    private final ChatModel chatModel;
    private final DreamMeaningRepository dreamMeaningRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd HHmmss");

    @Override
    @Transactional
    public DreamMeaningDto createDreamMeaning(Integer userSeq, Integer diarySeq, DreamMeaningRequestDto dto) {
        String content;
        String isGood;
        try {
            // 1. 해몽 생성
            String prompt1 = dto.getInputContent() + " 이에 대한 꿈 해몽을 한국어로 간결하게 알려줘. 너무 장황하지 않고 딱 2~3줄 정도.";
            content = chatModel.call(prompt1);

            // 2. 해몽 평가 (좋음/나쁨 분류)
            String prompt2 = content + "이 해몽은 좋습니까? 반드시 '좋음' 또는 '나쁨'으로만 답하세요. 다른 말 절대 하지 마세요.";
            String sentiment = chatModel.call(prompt2).trim();
            log.info(sentiment);

            if (sentiment.contains("좋")) {
                isGood = "Y";
            } else if (sentiment.contains("나") || sentiment.contains("나쁨"))  {
                isGood = "N";
            } else {
                log.warn("AI 분류 실패 - 기본값 적용");
                isGood = "Y";
//                throw new AiCallFailedException("AI가 올바른 형식으로 분류하지 못했습니다. 답변: " + sentiment);
            }
//            content = "푸하하";
//            isGood = "Y";

        } catch (Exception e) {
            log.error("AI 해몽 생성 실패 - 기본값 적용", e);
            isGood = "Y";
            content = "이 꿈은 조만간 중요한 아이디어를 얻게 되거나, 스스로도 몰랐던 재능이나 의미 있는 정보를 발견하게 될 가능성을 암시하는 긍정적인 꿈입니다.";
//            throw new AiCallFailedException("AI 해몽 생성 중 오류가 발생했습니다.");
        }

//        isGood = "Y";
//        content = "현재 삶에서 방향을 잃었거나, 해결되지 않은 고민 속에 있다는 무의식의 표현입니다. 하지만 끝까지 나아가겠다는 의지 또한 반영된 긍정적인 메시지일 수 있습니다.";

        log.info("GPT 해몽 응답: {}", content);
        log.info("GPT 분류 결과 (isGood): {}", isGood);

        final String finalContent = content;
        final String finalIsGood = isGood;

        DreamMeaning dreamMeaning = dreamMeaningRepository.findByDiarySeq(diarySeq)
                .map(existing -> {
                    existing.update(finalContent, finalIsGood, dto.getInputContent());
                    return existing;
                })
                .orElseGet(() -> DreamMeaning.builder()
                        .userSeq(userSeq)
                        .diarySeq(diarySeq)
                        .inputContent(dto.getInputContent())
                        .resultContent(finalContent)
                        .isGood(finalIsGood)
                        .createdAt(LocalDateTime.now().format(FORMATTER))
                        .build()
                );

        dreamMeaningRepository.save(dreamMeaning);
        return DreamMeaningDto.fromEntity(dreamMeaning);
    }

    @Override
    public List<DreamMeaningDto> getAllDreamMeanings(Integer userSeq) {
        return dreamMeaningRepository.findByUserSeq(userSeq).stream()
                .map(DreamMeaningDto::fromEntity)
                .toList();
    }
    @Override
    public DreamMeaningDto getDreamMeaning(Integer userSeq, Integer diarySeq) {
        DreamMeaning dreamMeaning = dreamMeaningRepository.findByDiarySeq(diarySeq)
                .orElseThrow(() -> new NotFoundException("해당 꿈 해몽을 찾을 수 없습니다."));
//
//        if (!dreamMeaning.getUserSeq().equals(userSeq)) {
//            throw new UnauthorizedException("해당 해몽을 조회할 권한이 없습니다.");
//        }
        return DreamMeaningDto.fromEntity(dreamMeaning);
    }

    @Override
    public void deleteDreamMeaning(Integer userSeq, Integer diarySeq) {
        DreamMeaning dreamMeaning = dreamMeaningRepository.findByDiarySeq(diarySeq)
                .orElseThrow(() -> new NotFoundException("해당 꿈 해몽을 찾을 수 없습니다."));

        if (!dreamMeaning.getUserSeq().equals(userSeq)) {
            throw new UnauthorizedException("해당 해몽을 삭제할 권한이 없습니다.");
        }

        dreamMeaningRepository.delete(dreamMeaning);
    }
}