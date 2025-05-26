package com.c202.lucky.dailyFortune;

import com.c202.exception.types.AiCallFailedException;
import com.c202.exception.types.AlreadyExistsException;
import com.c202.lucky.dailyFortune.entity.DailyFortune;
import com.c202.lucky.dailyFortune.repository.DailyFortuneRepository;
import com.c202.lucky.dailyFortune.service.DailyFortuneServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClient.ResponseSpec;
import org.springframework.web.reactive.function.client.WebClient.RequestHeadersSpec;
import org.springframework.web.reactive.function.client.WebClient.RequestHeadersUriSpec;
import reactor.core.publisher.Mono;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DailyFortuneServiceImplTest {

    @Mock
    private DailyFortuneRepository dailyFortuneRepository;

    @Mock
    private ChatModel chatModel;

    @Mock
    private WebClient.Builder webClientBuilder;

    @Mock
    private WebClient webClient;

    @Mock
    @SuppressWarnings("rawtypes")
    private RequestHeadersUriSpec requestHeadersUriSpec; // 로 타입

    @Mock
    @SuppressWarnings("rawtypes")
    private RequestHeadersSpec requestHeadersSpec;

    @Mock
    private ResponseSpec responseSpec;

    @InjectMocks
    private DailyFortuneServiceImpl dailyFortuneService;

    private Integer userSeq;

    @BeforeEach
    void setUp() {
        userSeq = 1; // 테스트에 사용할 userSeq
    }

    @Test
    void createDailyFortune_success() {
        // given
        // (1) 이미 운세가 존재하지 않음
        when(dailyFortuneRepository.findByUserSeq(userSeq)).thenReturn(Optional.empty());

        // (2) WebClient 체이닝 Mock
        when(webClientBuilder.baseUrl(anyString())).thenReturn(webClientBuilder);
        when(webClientBuilder.build()).thenReturn(webClient);

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.header(anyString(), anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
//        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just("..."));


        // API 호출 결과 Mono.just(...) 로 가정
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just("19900101"));

        // (3) ChatModel Mock
        when(chatModel.call(anyString())).thenReturn("GPT가 생성한 운세 예시");

        // when
        // 이 메서드를 호출했을 때 예외가 발생하지 않아야 함
        assertDoesNotThrow(() -> dailyFortuneService.createDailyFortune(userSeq));

        // then
        // DailyFortune 저장 로직이 1회는 호출되어야 함
        verify(dailyFortuneRepository, times(1)).save(any(DailyFortune.class));
    }

    @Test
    void createDailyFortune_alreadyExists() {
        // given
        // 이미 운세가 존재함
        when(dailyFortuneRepository.findByUserSeq(userSeq))
                .thenReturn(Optional.of(new DailyFortune()));

        // when & then
        // 이미 존재 예외가 떠야 함
        assertThrows(AlreadyExistsException.class, () -> dailyFortuneService.createDailyFortune(userSeq));

        // save() 메서드는 호출되지 않아야 함
        verify(dailyFortuneRepository, never()).save(any(DailyFortune.class));
    }

    @Test
    void createDailyFortune_aiCallFail() {
        // given
        when(dailyFortuneRepository.findByUserSeq(userSeq)).thenReturn(Optional.empty());

        // WebClient Mock
        when(webClientBuilder.baseUrl(anyString())).thenReturn(webClientBuilder);
        when(webClientBuilder.build()).thenReturn(webClient);
        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(anyString())).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.header(anyString(), anyString())).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just("19990101"));

        // ChatModel에서 예외 발생
        when(chatModel.call(anyString())).thenThrow(new RuntimeException("AI ERROR"));

        // when & then
        assertThrows(AiCallFailedException.class, () -> dailyFortuneService.createDailyFortune(userSeq));
        verify(dailyFortuneRepository, never()).save(any(DailyFortune.class));
    }

    @Test
    void getDailyFortune_success() {
        // given
        DailyFortune fortune = DailyFortune.builder()
                .userSeq(userSeq)
                .content("오늘은 좋은 일이 있을 겁니다.")
                .build();
        when(dailyFortuneRepository.findByUserSeq(userSeq)).thenReturn(Optional.of(fortune));

        // when
        String result = dailyFortuneService.getDailyFortune(userSeq);

        // then
        assertEquals("오늘은 좋은 일이 있을 겁니다.", result);
    }

    @Test
    void getDailyFortune_notFound() {
        // given
        // 운세 없으면 Optional.empty()
        when(dailyFortuneRepository.findByUserSeq(userSeq)).thenReturn(Optional.empty());

        // when
        String result = dailyFortuneService.getDailyFortune(userSeq);

        // then
        // 존재하지 않으면 null 리턴
        assertNull(result);
    }
}
