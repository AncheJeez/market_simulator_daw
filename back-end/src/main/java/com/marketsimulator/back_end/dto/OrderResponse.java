package com.marketsimulator.back_end.dto;

import java.time.Instant;

public class OrderResponse {
    public Long id;
    public String symbol;
    public String status;
    public String orderType;
    public Double price;
    public Double quantity;
    public String timeInForce;
    public Instant createdAt;

    public OrderResponse(Long id, String symbol, String status, String orderType, Double price, Double quantity, String timeInForce, Instant createdAt) {
        this.id = id;
        this.symbol = symbol;
        this.status = status;
        this.orderType = orderType;
        this.price = price;
        this.quantity = quantity;
        this.timeInForce = timeInForce;
        this.createdAt = createdAt;
    }
}
