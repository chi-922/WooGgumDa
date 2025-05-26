package com.c202.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class GlobalFilter extends AbstractGatewayFilterFactory<GlobalFilter.Config> {

    public GlobalFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // 필터 전 처리: 요청 경로 출력
            ServerHttpRequest request = exchange.getRequest();
            String path = exchange.getRequest().getURI().getPath();
            log.info("Request path: " + path);

            if (path.contains("/blocked")) {
                log.warn("Request blocked: {}", path);
                exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                return exchange.getResponse().setComplete();
            }

            // 필터 체인 계속 진행
            return chain.filter(exchange).then(Mono.fromRunnable(() -> {

                // 후 처리: 응답이 완료된 후 처리할 작업
                log.info("[글로벌 필터] RESPONSE 응답 >>> IP : {}, URI : {} , 응답코드 : {}",
                        request.getRemoteAddress().getAddress(),
                        request.getURI(),
                        request.getMethod());
            }));
        };
    }

    @Override
    public List<String> shortcutFieldOrder() {
        // 필터 설정에 필요한 필드들의 순서를 설정
        return new ArrayList<>();
    }

    public static class Config {
    }
}
