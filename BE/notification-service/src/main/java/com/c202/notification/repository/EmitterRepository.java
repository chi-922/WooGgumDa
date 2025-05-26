package com.c202.notification.repository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Slf4j
@Repository
public class EmitterRepository {

    // Emitter 저장소
    private final Map<Integer, SseEmitter> emitters = new ConcurrentHashMap<>();

    // 이벤트 캐시 저장소
    private final Map<Integer, Object> eventCache = new ConcurrentHashMap<>();

    // 읽기/쓰기 락 (더 정교한 동시성 제어를 위함)
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
    private final ReentrantReadWriteLock.ReadLock readLock = lock.readLock();
    private final ReentrantReadWriteLock.WriteLock writeLock = lock.writeLock();

    public SseEmitter save(Integer userSeq, SseEmitter emitter) {
        writeLock.lock();
        try {
            log.info("새로운 Emitter 등록: userSeq={}", userSeq);
            // 기존 값이 있으면 먼저 제거
            if (emitters.containsKey(userSeq)) {
                log.info("기존 Emitter 발견, 교체: userSeq={}", userSeq);
                SseEmitter oldEmitter = emitters.get(userSeq);
                try {
                    oldEmitter.complete();
                } catch (Exception e) {
                    log.warn("기존 Emitter 종료 중 오류 (무시됨): {}", e.getMessage());
                }
            }
            emitters.put(userSeq, emitter);
            return emitter;
        } finally {
            writeLock.unlock();
        }
    }

    public void saveEventCache(Integer userSeq, Object event) {
        writeLock.lock();
        try {
            log.debug("이벤트 캐시 저장: userSeq={}", userSeq);
            eventCache.put(userSeq, event);
        } finally {
            writeLock.unlock();
        }
    }

    public SseEmitter getEmitter(Integer userSeq) {
        readLock.lock();
        try {
            return emitters.get(userSeq);
        } finally {
            readLock.unlock();
        }
    }

    public boolean existsEmitter(Integer userSeq) {
        readLock.lock();
        try {
            return emitters.containsKey(userSeq);
        } finally {
            readLock.unlock();
        }
    }

    public void remove(Integer userSeq) {
        writeLock.lock();
        try {
            if (emitters.containsKey(userSeq)) {
                log.info("Emitter 제거: userSeq={}", userSeq);
                emitters.remove(userSeq);

                // 이벤트 캐시도 함께 제거
                if (eventCache.containsKey(userSeq)) {
                    eventCache.remove(userSeq);
                }
            }
        } finally {
            writeLock.unlock();
        }
    }

    public int countEmitters() {
        readLock.lock();
        try {
            return emitters.size();
        } finally {
            readLock.unlock();
        }
    }
}