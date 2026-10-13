
package com.arham.trades.repository;

import com.arham.trades.entity.Trade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TradeRepository extends JpaRepository<Trade, Long> {

    Optional<Trade> findByTradeId(String tradeId);

    boolean existsByTradeId(String tradeId);
}
