package com.c202.lucky.luckyNumber.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "luckynumber")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LuckyNumber {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer luckyNumberSeq;

    private Integer userSeq;

    private Integer number1;
    private Integer number2;
    private Integer number3;
    private Integer number4;
    private Integer number5;
    private Integer number6;

    @Column(nullable = false, length = 15)
    private String createdAt;
}