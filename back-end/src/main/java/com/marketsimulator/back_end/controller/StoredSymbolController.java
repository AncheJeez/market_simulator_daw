package com.marketsimulator.back_end.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.marketsimulator.back_end.dto.StoredSymbolResponse;
import com.marketsimulator.back_end.service.StoredSymbolService;

@RestController
@RequestMapping("/api/market/stored")
public class StoredSymbolController {
	private final StoredSymbolService service;

	public StoredSymbolController(StoredSymbolService service) {
		this.service = service;
	}

	@GetMapping
	public List<StoredSymbolResponse> list() {
		return service.getStoredSymbols();
	}
}
