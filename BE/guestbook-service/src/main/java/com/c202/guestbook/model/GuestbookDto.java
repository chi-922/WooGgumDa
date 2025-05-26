package com.c202.guestbook.model;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestbookDto {
    private Integer guestbookSeq;

    @Setter
    private Integer ownerSeq; // 방명록 주인의 아이디

    @Setter
    private Integer writerSeq; // 작성자의 아이디

    private String writerNickname;
    private Integer writerIconSeq;

    private String content;
    private String createdAt;
    private String updatedAt;
    private String deletedAt;
    private String isDeleted;


}
