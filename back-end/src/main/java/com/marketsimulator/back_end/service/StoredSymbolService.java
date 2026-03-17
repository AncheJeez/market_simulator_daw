package com.marketsimulator.back_end.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.marketsimulator.back_end.dto.StoredSymbolResponse;
import com.marketsimulator.back_end.repository.MarketDataRepository;
import com.marketsimulator.back_end.repository.SymbolRepository;

@Service
public class StoredSymbolService {
	private final MarketDataRepository marketRepository;
	private final SymbolRepository symbolRepository;

	public StoredSymbolService(MarketDataRepository marketRepository, SymbolRepository symbolRepository) {
		this.marketRepository = marketRepository;
		this.symbolRepository = symbolRepository;
	}

	public List<StoredSymbolResponse> getStoredSymbols() {
		Map<String, String> nameBySymbol = symbolRepository.findAll().stream()
			.collect(Collectors.toMap(item -> item.getTicker().toUpperCase(), item -> item.getName()));

		return marketRepository.findLastFetchedPerSymbol().stream()
			.map(entry -> new StoredSymbolResponse(
				entry.getSymbol(),
				nameBySymbol.getOrDefault(entry.getSymbol().toUpperCase(), entry.getSymbol()),
				entry.getFetchedAt()
			))
			.toList();
	}
}
