package com.marketsimulator.back_end.dto;

import java.time.Instant;
import java.time.LocalDate;

public record StoredSymbolResponse(String symbol, String name, Instant lastFetchedAt, LocalDate latestDate,
	double open, double high, double low, double close, long volume, Double previousClose, Double priceChange,
	Double changePercent, long records) {
}
