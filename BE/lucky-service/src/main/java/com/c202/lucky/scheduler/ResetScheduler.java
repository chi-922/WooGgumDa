package com.c202.lucky.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ResetScheduler {

    private final ResetService resetService;

    @Scheduled(cron = "0 0 0 * * *")
    public void resetDailyData() {
        log.info("[스케줄러] 12시 정각 - 행운 번호 및 운세 초기화 시작");
        resetService.resetAllData();
        log.info("[스케줄러] 모든 데이터 초기화 완료");
    }
}