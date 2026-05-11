package com.marketsimulator.back_end.dto;

public class OrderPreviewResponse {
    public String symbol;
    public double price;
    public long investAmount;
    public double quantity;

    public OrderPreviewResponse(String symbol, double price, long investAmount, double quantity) {
        this.symbol = symbol;
        this.price = price;
        this.investAmount = investAmount;
        this.quantity = quantity;
    }
}
