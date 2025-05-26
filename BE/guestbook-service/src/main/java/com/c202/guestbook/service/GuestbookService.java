package com.c202.guestbook.service;

import com.c202.guestbook.model.GuestbookDto;
import com.c202.guestbook.model.GuestbookPageResponse;

import java.util.List;

public interface GuestbookService {
    GuestbookDto createGuestbook(int ownerSeq, int writerSeq, GuestbookDto guestbookDTO);
    GuestbookPageResponse getAllGuestbooks(int ownerSeq, int page);
    void deleteGuestbook(int userSeq, int guestbookSeq);
}