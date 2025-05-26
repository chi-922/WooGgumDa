package com.c202.guestbook.repository;


import com.c202.guestbook.entity.Guestbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GuestbookRepository extends JpaRepository<Guestbook, Integer> {
    Optional<Guestbook> findByGuestbookSeq(Integer guestbookSeq);
    Page<Guestbook> findByOwnerSeqAndIsDeleted(Integer ownerSeq, String isDeleted, Pageable pageable);

}