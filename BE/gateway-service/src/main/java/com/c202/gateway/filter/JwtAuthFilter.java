package com.c202.gateway.filter;

import com.c202.gateway.util.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;


@Component
@Slf4j
public class JwtAuthFilter  extends AbstractGatewayFilterFactory<JwtAuthFilter.Config> {
    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        super(JwtAuthFilter.Config.class);
        this.jwtUtil = jwtUtil;
    }

    public static class Config {
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getPath().toString();

            if (path.equals("/api/auth/refresh")) {
                log.info("[JWT 필터] /auth/refresh 경로이므로 필터 우회");
                return chain.filter(exchange);
            }

            String token = resolveToken(exchange);

            if (token == null) {
                log.warn("Authorization 헤더가 없거나 Bearer 토큰이 아님");
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            // 토큰 유효성 검증
            return jwtUtil.validateToken(token)
                    .flatMap(isValid -> {
                        if (!isValid) {
                            log.warn("유효하지 않은 토큰 또는 블랙리스트에 있는 토큰");
                            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                            return exchange.getResponse().setComplete();
                        }

                        // 토큰이 유효하면 사용자 정보를 추출하여 헤더에 추가
                        int userSeq = jwtUtil.getUserSeq(token);
                        ServerWebExchange modifiedExchange = exchange.mutate()
                                .request(builder -> builder
                                        .header("X-User-Seq", String.valueOf(userSeq))
                                )
                                .build();

                        log.info("[JWT 필터] 유효성 검증 성공 >>> userSeq: {}", userSeq);
                        return chain.filter(modifiedExchange);
                    });
        };
    }

    private String resolveToken(ServerWebExchange exchange) {
        String bearerToken = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
