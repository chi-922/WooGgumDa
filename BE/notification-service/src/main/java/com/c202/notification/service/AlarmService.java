package com.c202.notification.service;

import com.c202.exception.types.NotFoundException;
import com.c202.notification.entity.Alarm;
import com.c202.notification.model.AlarmMessageDto;
import com.c202.notification.repository.AlarmRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlarmService {

    private final AlarmRepository alarmRepository;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd HHmmss");



    @Transactional
    public Alarm saveAlarm(AlarmMessageDto alarmMessage) {
        String now = LocalDateTime.now().format(DATE_TIME_FORMATTER);
        Alarm alarm = Alarm.builder()
                .userSeq(alarmMessage.getUserSeq())
                .diarySeq(alarmMessage.getDiarySeq())
                .content(alarmMessage.getContent())
                .type(alarmMessage.getType())
                .createdAt(now)
                .isRead("N")
                .build();
        Alarm saved = alarmRepository.save(alarm);
        log.info("알림 저장 완료: {}", saved);
        return saved;
    }

    // 사용자의 알림 목록 조회
    public List<Alarm> getAlarms(Integer userSeq) {

        return alarmRepository.findByUserSeqOrderByCreatedAtDesc(userSeq);
    }

    // 사용자의 최근 알림 목록 조회
    public List<Alarm> getRecentAlarms(Integer userSeq, int count) {
        Pageable pageable = PageRequest.of(0, count, Sort.by("createdAt").descending());
        Page<Alarm> alarmPage = alarmRepository.findByUserSeq(userSeq, pageable);
        return alarmPage.getContent();
    }

    // 사용자의 알림 목록 페이지네이션
    public Map<String, Object> getPagedAlarms(Integer userSeq, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Alarm> alarmPage = alarmRepository.findByUserSeq(userSeq, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("alarms", alarmPage.getContent());
        response.put("currentPage", alarmPage.getNumber());
        response.put("totalItems", alarmPage.getTotalElements());
        response.put("totalPages", alarmPage.getTotalPages());

        return response;
    }

    // 특정 알림을 읽음 처리
    @Transactional
    public Alarm markAsRead(Integer alarmSeq) {
        Alarm alarm = alarmRepository.findById(alarmSeq)
                .orElseThrow(() -> new NotFoundException("알림을 찾을 수 없습니다. ID: " + alarmSeq));

        if ("Y".equals(alarm.getIsRead())) {
            return alarm;
        }

        alarm.markAsRead();
        return alarmRepository.save(alarm);
    }

    // 사용자의 모든 알림을 읽음
    @Transactional
    public void markAllAsRead(Integer userSeq) {
        List<Alarm> unreadAlarms = alarmRepository.findByUserSeqAndIsRead(userSeq, "N");

        if (unreadAlarms.isEmpty()) {
            return;
        }

        unreadAlarms.forEach(Alarm::markAsRead);
        alarmRepository.saveAll(unreadAlarms);
        log.info("사용자 {}의 {} 개 알림을 읽음 처리함", userSeq, unreadAlarms.size());
    }

    // 알림 삭제
    @Transactional
    public Integer deleteAlarm(Integer alarmSeq) {
        Alarm alarm = alarmRepository.findById(alarmSeq)
                .orElseThrow(() -> new NotFoundException("알림을 찾을 수 없습니다. ID: " + alarmSeq));

        Integer userSeq = alarm.getUserSeq();
        alarmRepository.delete(alarm);
        log.info("알림 {} 삭제 완료", alarmSeq);
        return userSeq;
    }

    // 모든 알림 삭제
    @Transactional
    public void deleteAllAlarms(Integer userSeq) {
        List<Alarm> userAlarms = alarmRepository.findByUserSeq(userSeq);

        if (userAlarms.isEmpty()) {
            return;
        }

        alarmRepository.deleteAll(userAlarms);
        log.info("사용자 {}의 {} 개 알림 삭제 완료", userSeq, userAlarms.size());
    }

    public long getUnreadCount(Integer userSeq) {
        return alarmRepository.countByUserSeqAndIsRead(userSeq, "N");
    }
}