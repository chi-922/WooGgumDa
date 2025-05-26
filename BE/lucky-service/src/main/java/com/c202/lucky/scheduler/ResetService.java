package com.c202.lucky.scheduler;
import com.c202.lucky.dailyFortune.repository.DailyFortuneRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.c202.lucky.luckyNumber.repository.LuckyNumberRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResetService {

    private final LuckyNumberRepository luckyNumberRepository;
    private final DailyFortuneRepository dailyFortuneRepository;

    public void resetAllData() {
        log.info("[ResetService] 행운 번호 및 운세 초기화 시작");

        luckyNumberRepository.deleteAll();
        dailyFortuneRepository.deleteAll();

        log.info("[ResetService] 모든 초기화 완료");
    }
}