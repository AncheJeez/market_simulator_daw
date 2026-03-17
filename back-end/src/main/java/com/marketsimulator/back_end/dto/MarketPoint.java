package com.marketsimulator.back_end.dto;

import java.time.LocalDate;

public record MarketPoint(LocalDate date, double open, double high, double low, double close, long volume) {
}
