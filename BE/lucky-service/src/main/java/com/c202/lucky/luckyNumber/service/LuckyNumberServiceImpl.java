package com.c202.lucky.luckyNumber.service;

import com.c202.exception.types.AlreadyExistsException;
import com.c202.exception.types.ValidationException;
import com.c202.lucky.luckyNumber.repository.LuckyNumberRepository;
import com.c202.lucky.luckyNumber.entity.LuckyNumber;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LuckyNumberServiceImpl implements LuckyNumberService {
    private final LuckyNumberRepository luckyNumberRepository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd HHmmss");
    private static final Random RANDOM = new Random();

    @Override
    @Transactional
    public void createLuckyNumber(Integer userSeq) {
        if (luckyNumberRepository.findByUserSeq(userSeq).isPresent()) {
            throw new AlreadyExistsException("오늘은 이미 생성된 행운 번호가 있습니다");
        }

        List<Integer> luckyNumbers = generateLuckyNumbers();

        LuckyNumber luckyNumber = LuckyNumber.builder()
                .userSeq(userSeq)
                .number1(luckyNumbers.get(0))
                .number2(luckyNumbers.get(1))
                .number3(luckyNumbers.get(2))
                .number4(luckyNumbers.get(3))
                .number5(luckyNumbers.get(4))
                .number6(luckyNumbers.get(5))
                .createdAt(LocalDateTime.now().format(FORMATTER))
                .build();

        luckyNumberRepository.save(luckyNumber);
    }

    @Override
    public List<Integer> getLuckyNumber(Integer userSeq) {
        return luckyNumberRepository.findByUserSeq(userSeq)
                .map(luckyNumber -> List.of(
                        luckyNumber.getNumber1(),
                        luckyNumber.getNumber2(),
                        luckyNumber.getNumber3(),
                        luckyNumber.getNumber4(),
                        luckyNumber.getNumber5(),
                        luckyNumber.getNumber6()
                ))
                .orElse(null);
    }

    private List<Integer> generateLuckyNumbers() {
        return RANDOM.ints(1, 46)
                .distinct()
                .limit(6)
                .boxed()
                .collect(Collectors.toList());
    }
}