package com.c202.notification.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConnectionInfoDto {
    private Integer userId;
    private String connectedAt;
    private Integer activeUsers;
    private String status;
}