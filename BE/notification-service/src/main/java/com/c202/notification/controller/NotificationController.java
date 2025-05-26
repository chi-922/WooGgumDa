package com.c202.notification.controller;

import com.c202.dto.ResponseDto;
import com.c202.notification.entity.Alarm;
import com.c202.notification.service.AlarmService;
import com.c202.notification.service.SseEmitterService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {

    private final SseEmitterService sseEmitterService;
    private final AlarmService alarmService;

    // SSE 연결 생성 및 초기화
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@RequestHeader("X-User-Seq") @NotNull Integer userSeq) {
        try {
            return sseEmitterService.createEmitter(userSeq);
        } catch (Exception e) {
            log.error("SSE 연결 생성 중 오류: {}", e.getMessage(), e);
            // SSE 연결 오류 시 빈 emitter 반환 (status 200)
            SseEmitter emitter = new SseEmitter(0L);
            emitter.complete();
            return emitter;
        }
    }

    // 연결 정보 조회
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getConnectionInfo() {
        return ResponseEntity.ok(Map.of(
                "activeConnections", sseEmitterService.getActiveConnectionCount(),
                "serverTime", LocalDateTime.now().toString()
        ));
    }

    // 연결 상태 확인
    @GetMapping("/ping")
    public ResponseEntity<?> pingConnection(
            @RequestHeader("X-User-Seq") @NotNull Integer userSeq) {
        boolean isActive = sseEmitterService.testConnection(userSeq);
        if (isActive) {
            return ResponseEntity.ok(Map.of("message", "연결이 활성화되어 있습니다."));
        } else {
            return ResponseEntity.status(HttpStatus.GONE)
                    .body(Map.of("message", "연결이 존재하지 않습니다."));
        }
    }

    // 사용자의 알림 목록 조회
    @GetMapping("/list")
    public ResponseEntity<ResponseDto<List<Alarm>>> getAlarms(@RequestHeader("X-User-Seq") @NotNull Integer userSeq) {
        List<Alarm> alarms = alarmService.getAlarms(userSeq);
        return ResponseEntity.ok(ResponseDto.success(200, "알림 목록 조회 성공", alarms));
    }

    // 사용자의 알림 목록을 페이지네이션으로 조회
    @GetMapping("/list/page")
    public ResponseEntity<ResponseDto<Map<String, Object>>> getPagedAlarms(
            @RequestHeader("X-User-Seq") @NotNull Integer userSeq,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Map<String, Object> pagedData = alarmService.getPagedAlarms(userSeq, page, size);
        return ResponseEntity.ok(ResponseDto.success(200, "페이지 알림 목록 조회 성공", pagedData));
    }

    // 특정 알림을 읽음 처리
    @PutMapping("/read/{alarmId}")
    public ResponseEntity<ResponseDto<?>> markAsRead(@PathVariable Integer alarmId) {
        Alarm alarm = alarmService.markAsRead(alarmId);
        sseEmitterService.updateUnreadCount(alarm.getUserSeq());
        return ResponseEntity.ok(ResponseDto.success(200, "알림 읽음 처리 완료"));
    }

    // 사용자의 모든 알림을 읽음 처리
    @PutMapping("/read-all")
    public ResponseEntity<ResponseDto<?>> markAllAsRead(@RequestHeader("X-User-Seq") @NotNull Integer userSeq) {
        alarmService.markAllAsRead(userSeq);
        sseEmitterService.notifyClient(userSeq, "unread", Map.of("count", 0L));
        return ResponseEntity.ok(ResponseDto.success(200, "모든 알림 읽음 처리 완료"));
    }

    // 특정 알림 삭제
    @DeleteMapping("/delete/{alarmId}")
    public ResponseEntity<ResponseDto<?>> deleteAlarm(@PathVariable Integer alarmId) {
        Integer userSeq = alarmService.deleteAlarm(alarmId);
        if (userSeq != null) {
            long unreadCount = alarmService.getUnreadCount(userSeq);
            sseEmitterService.notifyClient(userSeq, "alarm-deleted", Map.of(
                    "alarmId", alarmId,
                    "unreadCount", unreadCount
            ));
        }
        return ResponseEntity.ok(ResponseDto.success(200, "알림 삭제 완료", null));
    }

    // 사용자의 모든 알림 삭제
    @DeleteMapping("/delete-all")
    public ResponseEntity<ResponseDto<?>> deleteAllAlarms(@RequestHeader("X-User-Seq") @NotNull Integer userSeq) {
        alarmService.deleteAllAlarms(userSeq);
        sseEmitterService.notifyClient(userSeq, "all-alarms-deleted", Map.of("userSeq", userSeq));
        return ResponseEntity.ok(ResponseDto.success(200, "모든 알림 삭제 완료", null));
    }

    // 읽지 않은 알림 개수 조회
    @GetMapping("/unread")
    public ResponseEntity<ResponseDto<Map<String, Long>>> getUnreadCount(@RequestHeader("X-User-Seq") @NotNull Integer userSeq) {
        Long count = alarmService.getUnreadCount(userSeq);
        return ResponseEntity.ok(ResponseDto.success(200, "읽지 않은 알림 개수 조회 성공", Map.of("count", count)));
    }
}