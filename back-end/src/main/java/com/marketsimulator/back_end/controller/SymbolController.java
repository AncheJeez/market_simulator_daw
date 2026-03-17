package com.marketsimulator.back_end.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.marketsimulator.back_end.dto.SymbolResponse;
import com.marketsimulator.back_end.service.SymbolService;

@RestController
@RequestMapping("/api/symbols")
public class SymbolController {
	private final SymbolService service;

	public SymbolController(SymbolService service) {
		this.service = service;
	}

	@GetMapping
	public List<SymbolResponse> list() {
		return service.getAll().stream()
			.map(symbol -> new SymbolResponse(symbol.getId(), symbol.getTicker(), symbol.getName()))
			.toList();
	}
}
