package com.c202.subscribe.controller;

import com.c202.dto.ResponseDto;
import com.c202.subscribe.model.SubscriptionProfileDto;
import com.c202.subscribe.service.SubscribeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscribeController {

    private final SubscribeService subscribeService;

    @PatchMapping("/{subscribedSeq}")
    public ResponseEntity<ResponseDto<String>> toggleSubscription(
            @RequestHeader("X-User-Seq") Integer subscriberSeq,
            @PathVariable Integer subscribedSeq) {

        String  subscriptionStatus  = subscribeService.toggleSubscription(subscriberSeq, subscribedSeq);
        return ResponseEntity.ok(ResponseDto.success(200, "구독 상태 변경 완료", subscriptionStatus ));
    }

    @GetMapping
    public ResponseEntity<ResponseDto<List<SubscriptionProfileDto>>> getSubscriptions(@RequestHeader("X-User-Seq") Integer userSeq){
        List<SubscriptionProfileDto> subscriptions = subscribeService.getSubscriptions(userSeq); // userSeq가 구독한 목록 조회
        return ResponseEntity.ok(ResponseDto.success(200, "구독 목록 조회 완료", subscriptions));
    }

    @GetMapping("/check/{subscribedSeq}")
    public String checkSubscription(
            @RequestHeader("X-User-Seq") Integer subscriberSeq,
            @PathVariable Integer subscribedSeq) {
        boolean result = subscribeService.isSubscribed(subscriberSeq, subscribedSeq).equals("Y");
        return result ? "Y" : "N";
    }

}