package com.marketsimulator.back_end.dto;

import java.time.Instant;

public record SellHistoryResponse(Long id, String symbol, Double price, Double quantity, Long proceeds, Instant createdAt) {
}
