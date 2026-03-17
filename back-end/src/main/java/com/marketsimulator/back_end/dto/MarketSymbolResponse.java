package com.marketsimulator.back_end.dto;

import java.time.Instant;
import java.util.List;

public record MarketSymbolResponse(String symbol, String name, boolean cached, Instant fetchedAt,
	List<MarketPoint> points) {
}
