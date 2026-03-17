package com.marketsimulator.back_end.dto;

import java.time.Instant;

public record StoredSymbolResponse(String symbol, String name, Instant lastFetchedAt) {
}
