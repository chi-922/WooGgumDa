package com.c202.subscribe.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionProfileDto {
    private Integer subscribedSeq;
    private String nickname;
    private Integer iconSeq;

}
