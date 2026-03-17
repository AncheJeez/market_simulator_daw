package com.marketsimulator.back_end.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.marketsimulator.back_end.dto.MarketOverviewResponse;
import com.marketsimulator.back_end.service.MarketOverviewService;

@RestController
@RequestMapping("/api/market/overview")
public class MarketOverviewController {
	private final MarketOverviewService service;

	public MarketOverviewController(MarketOverviewService service) {
		this.service = service;
	}

	@GetMapping
	public List<MarketOverviewResponse> list() {
		return service.getOverview(null);
	}
}
