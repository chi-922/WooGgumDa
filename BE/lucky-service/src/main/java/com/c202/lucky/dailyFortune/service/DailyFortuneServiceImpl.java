package com.c202.lucky.dailyFortune.service;

import com.c202.exception.types.AiCallFailedException;
import com.c202.exception.types.AlreadyExistsException;
import com.c202.lucky.dailyFortune.entity.DailyFortune;
import com.c202.lucky.dailyFortune.repository.DailyFortuneRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyFortuneServiceImpl implements DailyFortuneService{
    private final ChatModel chatModel;
    private final DailyFortuneRepository dailyFortuneRepository;
    private final WebClient.Builder webClientBuilder;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd HHmmss");

    @Override
    @Transactional
    public void createDailyFortune(Integer userSeq) {
        if (dailyFortuneRepository.findByUserSeq(userSeq).isPresent()) {
            throw new AlreadyExistsException("오늘의 운세가 이미 생성되었습니다.");
        }

        String content;
//         try {

//             // 실제 배포 시 주석 해제
//             String birthDate = webClientBuilder
//                     .baseUrl("http://user-service")
//                     .build()
//                     .get()
//                     .uri("/api/users/birthdate")
//                     .header("X-User-Seq", String.valueOf(userSeq))
//                     .retrieve()
//                     .bodyToMono(String.class)
//                     .block();

//             String today = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일"));
//             String prompt = String.format(
//                     "%s 기준으로, 생년월일이 %s인 사람을 위한 오늘의 운세를 한국어로 간결하게 알려줘. 너무 장황하지 않고 딱 2~3줄 정도.", today, birthDate
//             );

//             // content = chatModel.call(prompt);
//             log.info("GPT 응답: {}", content);

//         } catch (Exception e) {
//             log.error("AI 운세 생성 실패", e);
//             content = "오늘은 새로운 기회가 찾아올 수 있는 날입니다. 주변 사람들과의 소통이 중요하니, 적극적으로 대화해 보세요. 긍정적인 에너지를 잃지 않는 것이 좋습니다.";
// //            throw new AiCallFailedException("AI 운세 생성 중 오류가 발생했습니다.");
//         }

       content = "오늘은 작은 행운이 따를 날이에요.\n" + //
                      "예상치 못한 기쁨이 찾아올지도 몰라요!";
        DailyFortune fortune = DailyFortune.builder()
                .userSeq(userSeq)
                .content(content)
                .createdAt(LocalDateTime.now().format(FORMATTER))
                .build();

        dailyFortuneRepository.save(fortune);
    }

    @Override
    public String getDailyFortune(Integer userSeq) {
        return dailyFortuneRepository.findByUserSeq(userSeq)
                .map(DailyFortune::getContent)
                .orElse(null);
    }
}
