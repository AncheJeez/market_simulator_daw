package com.marketsimulator.back_end.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.marketsimulator.back_end.dto.MarketSymbolResponse;
import com.marketsimulator.back_end.service.MarketDataService;

@RestController
@RequestMapping("/api/market-data")
public class MarketDataController {
	private final MarketDataService service;

	public MarketDataController(MarketDataService service) {
		this.service = service;
	}

	@GetMapping
	public ResponseEntity<List<MarketSymbolResponse>> getData(
		@RequestParam("symbols") String symbols,
		@RequestParam("days") int days,
		@RequestParam("apiKey") String apiKey) {
		if (days <= 0) {
			return ResponseEntity.badRequest().build();
		}
		List<String> symbolList = Arrays.stream(symbols.split(","))
			.map(String::trim)
			.filter(item -> !item.isBlank())
			.toList();
		if (symbolList.isEmpty()) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
		}
		return ResponseEntity.ok(service.getMarketData(symbolList, days, apiKey));
	}
}
