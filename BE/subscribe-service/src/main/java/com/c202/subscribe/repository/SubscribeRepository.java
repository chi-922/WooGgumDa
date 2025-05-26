package com.c202.subscribe.repository;

import com.c202.subscribe.entity.Subscribe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubscribeRepository extends JpaRepository<Subscribe, Integer> {
    boolean existsBySubscriberSeqAndSubscribedSeq(Integer subscriberSeq, Integer subscribedSeq);
    Optional<Subscribe> findBySubscriberSeqAndSubscribedSeq(Integer subscriberSeq, Integer subscribedSeq);
    List<Subscribe> findBySubscriberSeq(Integer subscriberSeq);

    void deleteBySubscriberSeq(Integer userSeq);
}