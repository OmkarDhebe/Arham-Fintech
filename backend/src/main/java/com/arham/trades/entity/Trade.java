
package com.arham.trades.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "trades", indexes = {
        @Index(name = "idx_trade_timestamp", columnList = "trade_timestamp")
})
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trade_id", nullable = false, unique = true)
    private String tradeId;

    @Column(nullable = false)
    private String client;

    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @Column(name = "trade_timestamp", nullable = false)
    private Instant timestamp;

    protected Trade() {
    }

    public Trade(String tradeId, String client, String symbol,
            Integer quantity, BigDecimal price, Instant timestamp) {
        this.tradeId = tradeId;
        this.client = client;
        this.symbol = symbol;
        this.quantity = quantity;
        this.price = price;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public String getTradeId() {
        return tradeId;
    }

    public String getClient() {
        return client;
    }

    public String getSymbol() {
        return symbol;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Instant getTimestamp() {
        return timestamp;
    }
}
