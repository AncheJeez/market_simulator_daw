package com.marketsimulator.back_end.dto;

import java.time.Instant;
import java.time.LocalDate;

public record MarketOverviewPoint(
	Long id,
	LocalDate date,
	double open,
	double high,
	double low,
	double close,
	long volume,
	Instant fetchedAt
) {
}
