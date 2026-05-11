package com.marketsimulator.back_end.dto;

public class OrderRequest {
    public String symbol; // ticker
    public Long investAmount; // in user's currency (long)
    public Double price; // optional override price
    public String orderType; // Limit, Market, etc.
    public String timeInForce; // GTC, IOC
}
