
package com.arham.trades.controller;

import com.arham.trades.entity.Trade;
import com.arham.trades.service.TradeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class MockBseController {

    private final TradeService tradeService;

    public MockBseController(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    @GetMapping("/getTrades")
    public List<Trade> getTrades(
            @RequestParam(defaultValue = "2000") int count) {
        return tradeService.createMockTrades(count);
    }
}
