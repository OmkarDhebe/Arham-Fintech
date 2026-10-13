
package com.arham.trades.controller;

import com.arham.trades.entity.Trade;
import com.arham.trades.service.TradePullService;
import com.arham.trades.service.TradeService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trades")
@CrossOrigin(origins = "http://localhost:5173")
public class TradeController {

    private final TradeService tradeService;
    private final TradePullService tradePullService;

    public TradeController(
            TradeService tradeService,
            TradePullService tradePullService) {
        this.tradeService = tradeService;
        this.tradePullService = tradePullService;
    }

    // Load stored trades immediately; never wait for a pull.
    @GetMapping
    public List<Trade> getTrades() {
        return tradeService.getAllTrades();
    }

    @GetMapping("/count")
    public long getTradeCount() {
        return tradeService.getTradeCount();
    }

    // One persistent SSE connection for future updates.
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamTrades() {
        return tradePullService.subscribe();
    }

    // Start a pull asynchronously; return immediately.
    @PostMapping("/pull")
    public ResponseEntity<Map<String, Object>> startPull() {
        boolean started = tradePullService.startPull();

        if (!started) {
            return ResponseEntity.status(409).body(Map.of(
                    "status", "already_running",
                    "message", "A trade pull is already in progress"));
        }

        return ResponseEntity.accepted().body(Map.of(
                "status", "started",
                "message", "Trade pull started in the background",
                "initialCount", tradePullService.getInitialCount()));
    }

    @GetMapping("/pull/status")
    public Map<String, Object> getPullStatus() {
        return Map.of(
                "inProgress", tradePullService.isPullInProgress());
    }
}
