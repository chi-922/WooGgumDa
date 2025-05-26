package com.c202.notification.model;

import com.c202.notification.entity.Alarm;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlarmResponseDto {
    private Integer alarmSeq;
    private Integer diarySeq;
    private String content;
    private String type;
    private String createdAt;

    private boolean isRead;

    public static AlarmResponseDto toDto(Alarm alarm) {
        return AlarmResponseDto.builder()
                .alarmSeq(alarm.getAlarmSeq())
                .diarySeq(alarm.getDiarySeq())
                .content(alarm.getContent())
                .type(alarm.getType())
                .createdAt(alarm.getCreatedAt())
                .isRead("Y".equals(alarm.getIsRead()))
                .build();
    }
}