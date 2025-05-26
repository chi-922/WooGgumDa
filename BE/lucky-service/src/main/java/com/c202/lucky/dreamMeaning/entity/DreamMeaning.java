package com.c202.lucky.dreamMeaning.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Builder
@Table(name = "dreammeaning")
@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DreamMeaning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer dreamMeaningSeq;

    private Integer userSeq;

    @Column(nullable = false, unique = true)
    private Integer diarySeq;

    @Column(nullable = false)
    private String inputContent;

    @Column(nullable = false)
    private String resultContent;

    @Column(nullable = false, length = 15)
    private String createdAt;

    @Column(length = 1)
    private String isGood;

    public void update(String resultContent, String isGood, String inputContent) {
        this.resultContent = resultContent;
        this.isGood = isGood;
        this.inputContent = inputContent;
        this.createdAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd HHmmss"));
    }

}
