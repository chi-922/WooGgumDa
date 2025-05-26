package com.c202.guestbook.utill.rabbitmq;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlarmService {

    private final RabbitTemplate rabbitTemplate;

    public void sendGuestbookCreatedAlarm(Integer userSeq, String username, Integer diarySeq) {
        AlarmMessageDto alarmMessage = AlarmMessageDto.builder()
                .userSeq(userSeq)
                .content("똑똑 " + username + " 님의 따뜻한 메시지가 당신의 방명록에 새겨졌어요.")
                .type("GUESTBOOK_CREATED")
                .diarySeq(null)
                .requiresPersistence(true)
                .build();

        log.info("일기 생성 알림 발송: {}", alarmMessage);
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.ROUTING_KEY,
                alarmMessage
        );
    }
}