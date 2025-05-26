package com.c202.notification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlarmPageResponseDto {
    private List<AlarmResponseDto> alarms;
    private int currentPage;
    private long totalItems;
    private int totalPages;
}