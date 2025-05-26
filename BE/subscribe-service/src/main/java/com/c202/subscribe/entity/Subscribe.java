package com.c202.subscribe.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subscribe")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscribe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer subscribeSeq;

    @Column(nullable = false, length = 15)
    private String createdAt;

    private Integer subscriberSeq; // 구독하는 사용자
    private Integer subscribedSeq; // 구독 대상 사용자
}