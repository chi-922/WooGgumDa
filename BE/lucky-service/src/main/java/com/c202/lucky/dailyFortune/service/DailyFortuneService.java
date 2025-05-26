package com.c202.lucky.dailyFortune.service;

public interface DailyFortuneService {
    void createDailyFortune(Integer userSeq);
    String getDailyFortune(Integer userSeq);
}
