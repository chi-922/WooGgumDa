package com.c202.notification.config;

import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebServerConfig implements WebMvcConfigurer {

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatCustomizer() {
        return factory -> {
            // 비동기 타임아웃 설정 (30분)
            factory.addConnectorCustomizers(connector -> {
                // 비동기 타임아웃 설정 (SSE를 위해 충분히 길게 설정)
                connector.setProperty("asyncTimeout", "1800000"); // 30분

                // 연결 타임아웃 설정 (10분)
                connector.setProperty("connectionTimeout", "600000");

                // Keep-Alive 설정
                connector.setProperty("keepAliveTimeout", "600000"); // 10분
                connector.setProperty("maxKeepAliveRequests", "-1"); // 무제한

                // 스레드 풀 설정
                connector.setProperty("maxThreads", "200"); // 최대 스레드 수
                connector.setProperty("minSpareThreads", "20"); // 최소 유휴 스레드 수
            });
        };
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*") // 실제 배포 시 정확한 도메인으로 변경 필요
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Content-Type", "Authorization", "X-User-Seq", "Cache-Control", "Connection")
                .maxAge(3600); // 1시간 동안 preflight 캐싱
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/api/notifications/subscribe/**")
                .setCacheControl(CacheControl.noCache());
    }
}