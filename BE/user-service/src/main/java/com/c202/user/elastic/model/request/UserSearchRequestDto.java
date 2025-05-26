package com.c202.user.elastic.model.request;

import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSearchRequestDto {
    private String keyword;
    private boolean searchUsername;
    private boolean searchNickname;

    private Integer page;
    private Integer size;
}