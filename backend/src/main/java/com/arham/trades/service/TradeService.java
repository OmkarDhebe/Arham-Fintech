
package com.arham.trades.service;

import com.arham.trades.entity.Trade;
import com.arham.trades.repository.TradeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.IntStream;

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
            tradeRepository.saveAll(createMockTrades(2000));
            System.out.println("Initial trades created successfully.");
        }
    }

    public List<Trade> getAllTrades() {
        return tradeRepository.findAll();
    }

    public long getTradeCount() {
        return tradeRepository.count();
    }

    // Used by the mock exchange API to create an unsaved response.
    public List<Trade> createMockTrades(int count) {
        if (count < 1 || count > 10000) {
            throw new IllegalArgumentException(
                    "Trade count must be between 1 and 10000");
        }

        Instant now = Instant.now();

        return IntStream.range(0, count)
                .mapToObj(i -> new Trade(
                        "TRD-" + UUID.randomUUID(),
                        "CLIENT-" + (1000 + random.nextInt(9000)),
                        symbols[random.nextInt(symbols.length)],
                        1 + random.nextInt(1000),
                        BigDecimal.valueOf(
                                100 + random.nextDouble() * 2900).setScale(2, RoundingMode.HALF_UP),
                        now.minusSeconds(random.nextInt(86400))))
                .toList();
    }

    // Save trades received from the mock exchange API.
    @Transactional
    public List<Trade> savePulledTrades(List<Trade> trades) {
        return tradeRepository.saveAll(trades);
    }
}
