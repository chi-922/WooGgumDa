package com.c202.lucky.luckyNumber;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.c202.exception.types.AlreadyExistsException;
import com.c202.lucky.luckyNumber.entity.LuckyNumber;
import com.c202.lucky.luckyNumber.repository.LuckyNumberRepository;
import com.c202.lucky.luckyNumber.service.LuckyNumberServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

class LuckyNumberServiceImplTest {

    @Mock
    private LuckyNumberRepository luckyNumberRepository;

    @InjectMocks
    private LuckyNumberServiceImpl luckyNumberService;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd HHmmss");
    private final Integer userSeq = 1;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateLuckyNumber_success() {
        // given: 운세가 존재하지 않는 경우
        when(luckyNumberRepository.findByUserSeq(userSeq)).thenReturn(Optional.empty());

        // when: createLuckyNumber 호출
        luckyNumberService.createLuckyNumber(userSeq);

        // then: LuckyNumber가 저장(save)되어야 함 (정확히 1회 호출)
        verify(luckyNumberRepository, times(1)).save(any(LuckyNumber.class));
    }

    @Test
    void testCreateLuckyNumber_alreadyExists() {
        // given: 이미 운세가 존재하는 경우
        LuckyNumber existing = LuckyNumber.builder()
                .userSeq(userSeq)
                .number1(1)
                .number2(2)
                .number3(3)
                .number4(4)
                .number5(5)
                .number6(6)
                .createdAt(LocalDateTime.now().format(FORMATTER))
                .build();
        when(luckyNumberRepository.findByUserSeq(userSeq)).thenReturn(Optional.of(existing));

        // when & then: createLuckyNumber 호출 시 AlreadyExistsException 발생해야 함
        assertThrows(AlreadyExistsException.class, () -> luckyNumberService.createLuckyNumber(userSeq));

        // 그리고 save()는 호출되지 않아야 함
        verify(luckyNumberRepository, never()).save(any(LuckyNumber.class));
    }

    @Test
    void testGetLuckyNumber_success() {
        // given: 운세가 존재하는 경우, 번호들이 정해져 있음
        LuckyNumber luckyNumber = LuckyNumber.builder()
                .userSeq(userSeq)
                .number1(7)
                .number2(8)
                .number3(9)
                .number4(10)
                .number5(11)
                .number6(12)
                .createdAt(LocalDateTime.now().format(FORMATTER))
                .build();
        when(luckyNumberRepository.findByUserSeq(userSeq)).thenReturn(Optional.of(luckyNumber));

        // when: getLuckyNumber 호출
        List<Integer> result = luckyNumberService.getLuckyNumber(userSeq);

        // then: 반환되는 리스트는 [7, 8, 9, 10, 11, 12] 이어야 함
        List<Integer> expected = List.of(7, 8, 9, 10, 11, 12);
        assertEquals(expected, result);
    }

    @Test
    void testGetLuckyNumber_notFound() {
        // given: 운세가 존재하지 않는 경우
        when(luckyNumberRepository.findByUserSeq(userSeq)).thenReturn(Optional.empty());

        // when: getLuckyNumber 호출 시
        List<Integer> result = luckyNumberService.getLuckyNumber(userSeq);

        // then: null 반환되어야 함
        assertNull(result);
    }
}
