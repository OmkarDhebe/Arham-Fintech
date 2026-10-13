
package com.arham.trades.service;

import com.arham.trades.entity.Trade;
import com.arham.trades.repository.TradeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
public class TradeService implements CommandLineRunner {

    private final TradeRepository tradeRepository;
    private final Random random = new Random();

    private final String[] symbols = {
            "RELIANCE", "TCS", "INFY", "HDFCBANK",
            "ICICIBANK", "SBIN", "ITC", "WIPRO"
    };

    public TradeService(TradeRepository tradeRepository) {
        this.tradeRepository = tradeRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (tradeRepository.count() == 0) {
            System.out.println("Seeding 2000 existing trades...");
            generateTrades(2000);
            System.out.println("Initial trades created successfully.");
        }
    }

    public List<Trade> getAllTrades() {
        return tradeRepository.findAll();
    }

    public long getTradeCount() {
        return tradeRepository.count();
    }

    @Transactional
    public List<Trade> pullMockBseTrades(int count) {
        return generateTrades(count);
    }

    private List<Trade> generateTrades(int count) {
        Instant now = Instant.now();

        List<Trade> trades = java.util.stream.IntStream.range(0, count)
                .mapToObj(i -> new Trade(
                        "TRD-" + UUID.randomUUID(),
                        "CLIENT-" + (1000 + random.nextInt(9000)),
                        symbols[random.nextInt(symbols.length)],
                        1 + random.nextInt(1000),
                        BigDecimal.valueOf(
                                100 + random.nextDouble() * 2900).setScale(2, java.math.RoundingMode.HALF_UP),
                        now.minusSeconds(random.nextInt(86400))))
                .toList();

        return tradeRepository.saveAll(trades);
    }
}
