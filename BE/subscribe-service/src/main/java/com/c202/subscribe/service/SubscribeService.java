package com.c202.subscribe.service;

import com.c202.subscribe.model.SubscriptionProfileDto;

import java.util.List;

public interface SubscribeService {
    String toggleSubscription(Integer subscriberSeq, Integer subscribedSeq);
    List<SubscriptionProfileDto> getSubscriptions(Integer subscriberSeq);
    String isSubscribed(Integer subscriberSeq, Integer subscribedSeq);
}
