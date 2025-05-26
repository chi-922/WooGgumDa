package com.c202.notification.service;

import com.c202.notification.entity.Alarm;
import com.c202.notification.repository.EmitterRepository;
import com.c202.notification.model.ConnectionInfoDto;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class SseEmitterService {

    private final EmitterRepository emitterRepository;
    private final AlarmService alarmService;

    // 공유 스케줄러 (스레드 풀 재사용)
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);

    // 사용자별 하트비트 작업 관리
    private final Map<Integer, ScheduledFuture<?>> heartbeatTasks = new ConcurrentHashMap<>();

    // 하트비트 관련 상수
    private static final Long DEFAULT_TIMEOUT = TimeUnit.MINUTES.toMillis(30); // 30분
    private static final int HEARTBEAT_INTERVAL = 15; // 15초
    private static final int HEARTBEAT_INITIAL_DELAY = 5; // 5초 후 첫 하트비트

    public SseEmitter createEmitter(Integer userSeq) {
        // 고유 세션 ID 생성 (동일 사용자의 여러 연결 구분)
        String sessionId = userSeq + "_" + UUID.randomUUID().toString();
        log.info("SSE 연결 요청 → userSeq: {}, sessionId: {}", userSeq, sessionId);

        // 기존 연결 종료 (하트비트 작업 포함)
        closeExistingConnection(userSeq);

        // 새 연결 생성 (타임아웃 30분)
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);

        // 이벤트 핸들러 등록
        setupEmitterEventHandlers(userSeq, emitter);

        // 저장소에 저장
        emitterRepository.save(userSeq, emitter);

        // 하트비트 스케줄러 설정
        setupHeartbeat(userSeq, emitter);

        // 초기 데이터 전송
        try {
            sendInitialData(userSeq, emitter);
        } catch (Exception e) {
            log.error("초기 데이터 전송 실패: {}", e.getMessage());
            cleanup(userSeq);
            emitter.completeWithError(e);
            return null;
        }

        return emitter;
    }

    public void notifyClient(Integer userSeq, String eventName, Object data) {
        SseEmitter emitter = emitterRepository.getEmitter(userSeq);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name(eventName)
                        .data(data)
                        .reconnectTime(3000)); // 재연결 시간 3초
                log.debug("{} 이벤트를 userSeq: {}에게 전송 완료", eventName, userSeq);
            } catch (IOException e) {
                log.error("{} 이벤트 전송 실패: {}", eventName, e.getMessage());
                cleanup(userSeq);
            }
        }
    }

    public boolean testConnection(Integer userSeq) {
        if (!emitterRepository.existsEmitter(userSeq)) {
            return false;
        }

        SseEmitter emitter = emitterRepository.getEmitter(userSeq);
        if (emitter == null) {
            return false;
        }

        try {
            emitter.send(SseEmitter.event()
                    .name("ping")
                    .data("pong")
                    .reconnectTime(3000));
            return true;
        } catch (IOException e) {
            log.error("Ping 실패 - 연결이 끊어졌습니다: {}", e.getMessage());
            cleanup(userSeq);
            return false;
        }
    }

    public void updateUnreadCount(Integer userSeq) {
        try {
            long unreadCount = alarmService.getUnreadCount(userSeq);
            notifyClient(userSeq, "unread", Map.of("count", unreadCount));
        } catch (Exception e) {
            log.error("읽지 않은 알림 수 업데이트 실패: {}", e.getMessage());
        }
    }

    private void closeExistingConnection(Integer userSeq) {
        SseEmitter existingEmitter = emitterRepository.getEmitter(userSeq);
        if (existingEmitter != null) {
            try {
                existingEmitter.complete();
                log.debug("기존 연결 종료 완료 - userSeq: {}", userSeq);
            } catch (Exception e) {
                log.warn("기존 연결 종료 중 오류 발생 (무시됨): {}", e.getMessage());
            } finally {
                // 하트비트 작업 및 저장소에서 제거
                cleanup(userSeq);
            }
        }
    }

    private void setupEmitterEventHandlers(Integer userSeq, SseEmitter emitter) {
        // 연결 완료 이벤트
        emitter.onCompletion(() -> {
            log.info("SSE 연결 완료 → userSeq: {}", userSeq);
            cleanup(userSeq);
        });

        // 연결 타임아웃 이벤트
        emitter.onTimeout(() -> {
            log.info("SSE 연결 타임아웃 → userSeq: {}", userSeq);
            cleanup(userSeq);
        });

        // 오류 발생 이벤트
        emitter.onError((e) -> {
            log.warn("SSE 연결 오류 → userSeq: {}, error: {}", userSeq, e.getMessage());
            cleanup(userSeq);
        });
    }

    private void setupHeartbeat(Integer userSeq, SseEmitter emitter) {
        // 기존 하트비트 작업이 있다면 취소
        cancelHeartbeat(userSeq);

        // 새 하트비트 작업 생성 (5초 후부터 15초 간격으로 실행)
        ScheduledFuture<?> heartbeatTask = scheduler.scheduleAtFixedRate(() -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("heartbeat")
                        .data("ping")
                        .reconnectTime(3000));
                log.debug("Heartbeat sent to userSeq: {}", userSeq);
            } catch (Exception e) {
                log.warn("Heartbeat failed, closing connection for userSeq: {}: {}", userSeq, e.getMessage());
                try {
                    emitter.complete();
                } catch (Exception ignored) {
                    log.debug("연결 종료 중 추가 예외 발생 (무시됨)");
                } finally {
                    cleanup(userSeq);
                }
            }
        }, HEARTBEAT_INITIAL_DELAY, HEARTBEAT_INTERVAL, TimeUnit.SECONDS);

        // 하트비트 작업 저장
        heartbeatTasks.put(userSeq, heartbeatTask);
    }

    private void cancelHeartbeat(Integer userSeq) {
        ScheduledFuture<?> task = heartbeatTasks.remove(userSeq);
        if (task != null && !task.isDone()) {
            task.cancel(false);
            log.debug("하트비트 작업 취소 - userSeq: {}", userSeq);
        }
    }

    private void cleanup(Integer userSeq) {
        // 하트비트 작업 취소
        cancelHeartbeat(userSeq);

        // 저장소에서 제거
        emitterRepository.remove(userSeq);

        log.debug("SSE 리소스 정리 완료 - userSeq: {}", userSeq);
    }

    private void sendInitialData(Integer userSeq, SseEmitter emitter) throws IOException {
        // 연결 정보 전송
        emitter.send(SseEmitter.event()
                .name("connect")
                .data(ConnectionInfoDto.builder()
                        .userId(userSeq)
                        .connectedAt(LocalDateTime.now().toString())
                        .activeUsers(emitterRepository.countEmitters())
                        .status("CONNECTED")
                        .build())
                .reconnectTime(3000));

        // 읽지 않은 알림 개수 전송
        long unreadCount = alarmService.getUnreadCount(userSeq);
        emitter.send(SseEmitter.event()
                .name("unread")
                .data(Map.of("count", unreadCount))
                .reconnectTime(3000));

        // 최근 알림들 전송
        List<Alarm> recentAlarms = alarmService.getRecentAlarms(userSeq, 5);
        if (!recentAlarms.isEmpty()) {
            emitter.send(SseEmitter.event()
                    .name("recent-alarms")
                    .data(recentAlarms)
                    .reconnectTime(3000));
        }

        log.debug("초기 데이터 전송 완료 - userSeq: {}", userSeq);
    }

    public int getActiveConnectionCount() {
        return emitterRepository.countEmitters();
    }

    @PreDestroy
    public void shutdown() {
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(10, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
        log.info("SSE 스케줄러 종료 완료");
    }
}