package com.c202.guestbook.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "guestbook")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guestbook {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer guestbookSeq;

    private Integer ownerSeq; // 방명록 주인의 아이디

    private Integer writerSeq; // 작성자의 아이디

    @Column(length = 255, nullable = false)
    private String content;

    @Column(nullable = false, length = 15)
    private String createdAt;

    @Setter
    @Column(nullable = false, length = 15)
    private String updatedAt;

    @Setter
    @Column(nullable = true, length = 15)
    private String deletedAt;

    @Column(nullable = false, length = 1)
    private String isDeleted = "N";

    public void markAsDeleted() {
        this.isDeleted = "Y";
    }

}