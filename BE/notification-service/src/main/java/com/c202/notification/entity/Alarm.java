package com.c202.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "alarm")
public class Alarm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer alarmSeq;

    @Column(nullable = false)
    private Integer userSeq;

    @Column(nullable = true)
    private Integer diarySeq;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false)
    private String createdAt;

    @Column(length = 50)
    private String type;

    @Column(nullable = false, length = 1)
    private String isRead;

    // 알림을 읽음 상태로 변경
    public void markAsRead() {
        this.isRead = "Y";
    }

    // 알림이 읽었는지 확인
    public boolean isReadYn() {
        return "Y".equals(this.isRead);
    }

}