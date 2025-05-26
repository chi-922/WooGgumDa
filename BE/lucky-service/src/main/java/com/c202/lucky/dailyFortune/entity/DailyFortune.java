package com.c202.lucky.dailyFortune.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dailyfortune")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyFortune {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer fortuneSeq;
    private Integer userSeq;

    @Column(length = 1000)
    private String content;

    @Column(nullable = false, length = 15)
    private String createdAt;
}
