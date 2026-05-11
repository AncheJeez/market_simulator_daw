package com.marketsimulator.back_end.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.marketsimulator.back_end.dto.StoredSymbolResponse;
import com.marketsimulator.back_end.model.MarketData;
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
		Map<String, Long> recordsBySymbol = marketRepository.countBySymbol().stream()
			.collect(Collectors.toMap(entry -> entry.getSymbol().toUpperCase(), entry -> entry.getTotal()));

		return marketRepository.findLastFetchedPerSymbol().stream()
			.map(entry -> buildResponse(entry, nameBySymbol, recordsBySymbol))
			.toList();
	}

	private StoredSymbolResponse buildResponse(MarketDataRepository.SymbolFetchedAt entry,
		Map<String, String> nameBySymbol, Map<String, Long> recordsBySymbol) {
		String ticker = entry.getSymbol();
		List<MarketData> latestRows = marketRepository.findBySymbol_TickerOrderByDateDesc(ticker, PageRequest.of(0, 2));
		MarketData latest = latestRows.get(0);
		Double previousClose = latestRows.size() > 1 ? latestRows.get(1).getClose() : null;
		Double priceChange = previousClose == null ? null : latest.getClose() - previousClose;
		Double changePercent = previousClose == null || previousClose == 0
			? null
			: (priceChange / previousClose) * 100;

		return new StoredSymbolResponse(
			ticker,
			nameBySymbol.getOrDefault(ticker.toUpperCase(), ticker),
			entry.getFetchedAt(),
			latest.getDate(),
			latest.getOpen(),
			latest.getHigh(),
			latest.getLow(),
			latest.getClose(),
			latest.getVolume(),
			previousClose,
			priceChange,
			changePercent,
			recordsBySymbol.getOrDefault(ticker.toUpperCase(), 0L)
		);
	}
}
