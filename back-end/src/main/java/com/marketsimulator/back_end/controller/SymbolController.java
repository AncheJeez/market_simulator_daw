package com.marketsimulator.back_end.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;

import com.marketsimulator.back_end.dto.SymbolResponse;
import com.marketsimulator.back_end.service.SymbolService;
import com.marketsimulator.back_end.dto.OrderRequest;
import com.marketsimulator.back_end.dto.OrderPreviewResponse;
import com.marketsimulator.back_end.service.OrderService;

import java.util.Map;

@RestController
@RequestMapping("/api/symbols")
public class SymbolController {
	private final SymbolService service;
	private final OrderService orderService;

	public SymbolController(SymbolService service, OrderService orderService) {
		this.service = service;
		this.orderService = orderService;
	}

	@GetMapping
	public List<SymbolResponse> list() {
		return service.getAll().stream()
			.map(symbol -> new SymbolResponse(symbol.getId(), symbol.getTicker(), symbol.getName()))
			.toList();
	}

	@PostMapping(path = "/api/orders/preview")
	public ResponseEntity<?> previewOrder(@RequestBody OrderRequest req) {
		if (req == null || req.symbol == null || req.symbol.isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("message", "Symbol is required."));
		}
		OrderPreviewResponse resp = orderService.preview(req);
		return ResponseEntity.ok(resp);
	}
}
