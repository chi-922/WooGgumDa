package com.c202.notification.listener;

import com.c202.exception.types.BadRequestException;
import com.c202.notification.repository.EmitterRepository;
import com.c202.notification.model.AlarmMessageDto;
import com.c202.notification.service.AlarmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;

// RabbitMQ에서 알림 메시지를 수신하고 처리
@Slf4j
@Component
@RequiredArgsConstructor
public class AlarmListener {

    private final EmitterRepository emitterRepository;
    private final AlarmService alarmService;


    // RabbitMQ 큐에서 알림 메시지 수신 및 처리
    @RabbitListener(queues = "${rabbitmq.queue:alarm.created.queue}")
    public void handleAlarmMessage(final AlarmMessageDto alarmMessage) {
        log.info("Received alarm message: {}", alarmMessage);

        try {
            // 메시지 유효성 검증
            validateMessage(alarmMessage);

            // 알림 저장 및 전송
            processAlarmMessage(alarmMessage);

        } catch (BadRequestException e) {
            log.error("Invalid alarm message rejected: {}", e.getMessage());
            throw e; // 메시지 재처리하지 않음
        } catch (Exception e) {
            log.error("Error processing alarm message: {}", e.getMessage(), e);
        }
    }


    // 알림 메시지 유효성 검증
    private void validateMessage(AlarmMessageDto message) {
        if (message.getUserSeq() == null) {
            log.error("유효하지 않은 알림 메시지: userSeq가 null입니다.");
            throw new BadRequestException("유효하지 않은 알림 메시지");
        }

        if (message.getContent() == null || message.getContent().isBlank()) {
            log.error("유효하지 않은 알림 메시지: content가 비어있습니다.");
            throw new BadRequestException("유효하지 않은 알림 메시지");
        }
    }

    // 알림 메시지 처리 및 전송
    private void processAlarmMessage(AlarmMessageDto message) {

        if (message.isRequiresPersistence()) {
            alarmService.saveAlarm(message);
        }

        // 연결된 사용자에게 전송
        sendToConnectedUser(message);

        // 이벤트 캐시에 저장 (재연결 시 활용)
        if (message.isRequiresPersistence()) {
            emitterRepository.saveEventCache(message.getUserSeq(), message);
        }
    }


    // 연결된 사용자에게 알림 전송
    private void sendToConnectedUser(AlarmMessageDto message) {
        SseEmitter emitter = emitterRepository.getEmitter(message.getUserSeq());

        if (emitter != null) {
            try {
                // 알림 전송
                emitter.send(SseEmitter.event()
                        .name("alarm")
                        .data(message));

                // 읽지 않은 알림 개수 업데이트
                long unreadCount = alarmService.getUnreadCount(message.getUserSeq());
                emitter.send(SseEmitter.event()
                        .name("unread")
                        .data(Map.of("count", unreadCount)));

                log.info("알림 전송 완료 - userSeq: {}", message.getUserSeq());
            } catch (IOException e) {
                log.error("알림 전송 중 오류 발생: {}", e.getMessage());
                emitterRepository.remove(message.getUserSeq());
            }
        } else {
            log.info("SSE 연결 없음 - userSeq: {}", message.getUserSeq());
        }
    }
}