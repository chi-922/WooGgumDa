package com.c202.gateway.util;

import com.c202.gateway.blacklist.TokenBlacklistService;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.security.Key;

@Component
@Slf4j
public class JwtUtil {
    private final Key key;
    private final TokenBlacklistService tokenBlacklistService;

    public JwtUtil(@Value("${jwt.secret}") String secretKey, TokenBlacklistService tokenBlacklistService) {
        this.tokenBlacklistService = tokenBlacklistService;
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public Mono<Boolean> validateToken(String token) {
        // 먼저 블랙리스트 체크
        return tokenBlacklistService.isBlacklisted(token)
                .flatMap(isBlacklisted -> {
                    if (isBlacklisted) {
                        log.warn("블랙리스트에 있는 토큰으로 접근 시도: {}", token.substring(0, 10));
                        return Mono.just(false);
                    }

                    // 블랙리스트에 없으면 토큰 유효성 검증
                    try {
                        Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
                        return Mono.just(true);
                    } catch (ExpiredJwtException e) {
                        log.warn("만료된 JWT 토큰");
                        return Mono.just(false);
                    } catch (UnsupportedJwtException e) {
                        log.warn("지원되지 않는 JWT 토큰");
                        return Mono.just(false);
                    } catch (MalformedJwtException e) {
                        log.warn("잘못된 JWT 토큰 형식");
                        return Mono.just(false);
                    } catch (SignatureException e) {
                        log.warn("유효하지 않은 JWT 서명");
                        return Mono.just(false);
                    } catch (IllegalArgumentException e) {
                        log.warn("JWT 토큰이 비어 있음");
                        return Mono.just(false);
                    } catch (JwtException e) {
                        log.warn("JWT 검증 실패: {}", e.getMessage());
                        return Mono.just(false);
                    }
                });
    }

    public int getUserSeq(String token) {
        return ((int) Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("userSeq"));
    }
}