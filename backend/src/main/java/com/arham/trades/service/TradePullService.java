
package com.arham.trades.service;

import com.arham.trades.entity.Trade;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class TradePullService {

    private final TradeService tradeService;
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final AtomicBoolean pullInProgress = new AtomicBoolean(false);

    @Value("${trades.pull.delay-ms:30000}")
    private long delayMs;

    @Value("${trades.pull.initial-count:2000}")
    private int initialCount;

    public TradePullService(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(error -> emitters.remove(emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("Connected to trade stream"));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public boolean startPull() {
        if (!pullInProgress.compareAndSet(false, true)) {
            return false;
        }

        executor.submit(() -> {
            try {
                Thread.sleep(delayMs);

                List<Trade> newTrades = tradeService.pullMockBseTrades(initialCount);

                for (SseEmitter emitter : emitters) {
                    try {
                        emitter.send(SseEmitter.event()
                                .name("trades")
                                .data(newTrades));
                    } catch (IOException e) {
                        emitters.remove(emitter);
                    }
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                pullInProgress.set(false);
            }
        });

        return true;
    }

    public boolean isPullInProgress() {
        return pullInProgress.get();
    }

    public int getInitialCount() {
        return initialCount;
    }
}
