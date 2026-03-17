package com.marketsimulator.back_end.dto;

import java.time.LocalDate;

public record MarketOverviewResponse(
	String symbol,
	String name,
	long dataPoints,
	LocalDate latestDate,
	Double latestClose
) {
}
