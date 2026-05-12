package com.marketsimulator.back_end.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "sell_history")
public class SellHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Column(name = "symbol", length = 20, nullable = false)
    private String symbol;

    @Column(name = "price")
    private Double price;

    @Column(name = "quantity")
    private Double quantity;

    @Column(name = "proceeds")
    private Long proceeds;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected SellHistory() {}

    public SellHistory(UserAccount user, String symbol, Double price, Double quantity, Long proceeds, Instant createdAt) {
        this.user = user;
        this.symbol = symbol;
        this.price = price;
        this.quantity = quantity;
        this.proceeds = proceeds;
        this.createdAt = createdAt == null ? Instant.now() : createdAt;
    }

    public Long getId() { return id; }
    public UserAccount getUser() { return user; }
    public String getSymbol() { return symbol; }
    public Double getPrice() { return price; }
    public Double getQuantity() { return quantity; }
    public Long getProceeds() { return proceeds; }
    public Instant getCreatedAt() { return createdAt; }
}
