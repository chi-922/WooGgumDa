package com.c202.gateway.blacklist;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final ReactiveRedisTemplate<String, Object> reactiveRedisTemplate;
    private final String BLACKLIST_PREFIX = "token:blacklist:";

    // 토큰 블랙리스트 확인
    public Mono<Boolean> isBlacklisted(String token) {
        try {
            // 토큰을 SHA-256으로 해싱
            String tokenHash = DigestUtils.sha256Hex(token);
            String key = BLACKLIST_PREFIX + tokenHash;

            // Redis에서 해당 키가 존재하는지 확인
            return reactiveRedisTemplate.hasKey(key)
                    .doOnNext(isBlacklisted -> {
                        if (isBlacklisted) {
                            log.debug("토큰이 블랙리스트에 존재합니다. 토큰 해시: {}", tokenHash.substring(0, 10));
                        }
                    })
                    .onErrorResume(e -> {
                        log.error("토큰 블랙리스트 확인 중 오류 발생: {}", e.getMessage(), e);
                        return Mono.just(false);
                    });
        } catch (Exception e) {
            log.error("토큰 블랙리스트 확인 중 오류 발생: {}", e.getMessage(), e);
            return Mono.just(false);
        }
    }
}
