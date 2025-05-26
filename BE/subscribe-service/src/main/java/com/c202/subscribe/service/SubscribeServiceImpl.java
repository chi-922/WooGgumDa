package com.c202.subscribe.service;

import com.c202.exception.types.*;
import com.c202.subscribe.entity.Subscribe;
import com.c202.subscribe.model.SubscriptionProfileDto;
import com.c202.subscribe.repository.SubscribeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscribeServiceImpl implements SubscribeService {

    private final SubscribeRepository subscribeRepository;
    private final WebClient.Builder webClientBuilder;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd HHmmss");

    @Transactional
    @Override
    public String toggleSubscription(Integer subscriberSeq, Integer subscribedSeq) {
        if (subscriberSeq == null || subscribedSeq == null) {
            throw new BadRequestException("구독자 정보가 유효하지 않습니다.");
        }

        if (subscriberSeq.equals(subscribedSeq)) {
            throw new BadRequestException("본인을 구독할 수 없습니다.");
        }

        Optional<Subscribe> existingSubscription =
                subscribeRepository.findBySubscriberSeqAndSubscribedSeq(subscriberSeq, subscribedSeq);

        if (existingSubscription.isPresent()) {
            // 이미 구독 중이면 삭제 (구독 해제)
            subscribeRepository.delete(existingSubscription.get());
            return "구독 해제";
        } else {
            // 구독이 없으면 추가 (구독 등록)
            Subscribe subscribeEntity = Subscribe.builder()
                    .subscriberSeq(subscriberSeq)
                    .subscribedSeq(subscribedSeq)
                    .createdAt(LocalDateTime.now().format(FORMATTER))
                    .build();
            subscribeRepository.save(subscribeEntity);
            return "구독 성공";
        }
    }

    @Override
    public List<SubscriptionProfileDto> getSubscriptions(Integer subscriberSeq) {
        if (subscriberSeq == null) {
            throw new BadRequestException("구독자 정보가 유효하지 않습니다.");
        }
        // 1. 구독 대상 seq 목록 가져오기
        List<Integer> subscribedSeqList = subscribeRepository.findBySubscriberSeq(subscriberSeq)
                .stream()
                .map(Subscribe::getSubscribedSeq)
                .distinct()
                .collect(Collectors.toList());

        log.info("subscriberSeq = {}, subscribedSeqList = {}", subscriberSeq, subscribedSeqList);

        // 2. bulk 요청으로 user profile 조회
        Map<String, Object> response = webClientBuilder
                .baseUrl("http://user-service")
                .build()
                .post()
                .uri("/api/users/profiles")
                .bodyValue(subscribedSeqList)
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorMap(ex -> new WebClientCommunicationException("WebClient 통신 에러: " + ex.getMessage()))
                .block();

        List<Map<String, Object>> profiles = (List<Map<String, Object>>) response.get("data");

        // 3. profile map 으로 변경
        Map<Integer, Map<String, Object>> profileMap = profiles.stream()
                .collect(Collectors.toMap(
                        p -> (Integer) p.get("userSeq"),
                        p -> p
                ));

        // 4. 구독 정보 + 프로필 합쳐서 반환
        return subscribedSeqList.stream()
                .map(subscribedSeq -> {
                    Map<String, Object> profile = profileMap.getOrDefault(subscribedSeq, null);
                    String nickname = profile != null ? (String) profile.getOrDefault("nickname", "알 수 없음") : "알 수 없음";
                    Integer iconSeq = profile != null ? (Integer) profile.getOrDefault("iconSeq", 0) : 0;

                    return SubscriptionProfileDto.builder()
                            .subscribedSeq(subscribedSeq)
                            .nickname(nickname)
                            .iconSeq(iconSeq)
                            .build();
                })
                .collect(Collectors.toList());
    }
    @RabbitListener(queues = "user.withdrawn.queue")
    @Transactional
    public void handleUserWithdrawn(Integer userSeq) {
        log.info("유저 탈퇴 이벤트 수신: userSeq = {}", userSeq);
        subscribeRepository.deleteBySubscriberSeq(userSeq);
        log.info("구독 정보 삭제 완료: userSeq = {}", userSeq);
    }

    @Override
    public String isSubscribed(Integer subscriberSeq, Integer subscribedSeq) {
        if (subscriberSeq == null || subscribedSeq == null) {
            throw new BadRequestException("구독자 정보가 유효하지 않습니다.");
        }

        boolean result = subscribeRepository.findBySubscriberSeqAndSubscribedSeq(subscriberSeq, subscribedSeq).isPresent();

        return result ? "Y" : "N";
    }



}