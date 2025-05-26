package com.c202.notification.repository;

import com.c202.notification.entity.Alarm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AlarmRepository extends JpaRepository<Alarm, Integer> {

    // 사용자별 알림 목록 조회 (생성일 내림차순)
    List<Alarm> findByUserSeqOrderByCreatedAtDesc(Integer userSeq);


    // 사용자별 알림 목록 조회
    List<Alarm> findByUserSeq(Integer userSeq);

    // 사용자별 알림 목록 페이지네이션 조회
    Page<Alarm> findByUserSeq(Integer userSeq, Pageable pageable);

    // 사용자별, 읽음 상태별 알림 목록 조회
    List<Alarm> findByUserSeqAndIsRead(Integer userSeq, String isRead);

    // 사용자별, 읽음 상태별 알림 개수 조회
    long countByUserSeqAndIsRead(Integer userSeq, String isRead);

}