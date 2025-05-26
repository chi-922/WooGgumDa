package com.c202.lucky.dreamMeaning.model;

import com.c202.lucky.dreamMeaning.entity.DreamMeaning;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DreamMeaningDto {

    private Integer dreamMeaningSeq;
    private Integer userSeq;
    private Integer diarySeq;
    private String isGood;
    private String inputContent; // 사용자 입력
    private String resultContent; // 해몽 결과
    private String createdAt;

    public static DreamMeaningDto fromEntity(DreamMeaning entity) {
        return DreamMeaningDto.builder()
                .dreamMeaningSeq(entity.getDreamMeaningSeq())
                .userSeq(entity.getUserSeq())
                .diarySeq(entity.getDiarySeq())
                .isGood(entity.getIsGood())
                .inputContent(entity.getInputContent())
                .resultContent(entity.getResultContent())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
