package com.c202.lucky.luckyNumber.service;

import java.util.List;

public interface LuckyNumberService {
    void createLuckyNumber(Integer userSeq);

    List<Integer> getLuckyNumber(Integer userSeq);
}
