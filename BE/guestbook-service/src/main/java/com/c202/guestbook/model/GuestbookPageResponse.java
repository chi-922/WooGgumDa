package com.c202.guestbook.model;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class GuestbookPageResponse {

    private List<GuestbookDto> guestbooks;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private boolean isLast;
}
