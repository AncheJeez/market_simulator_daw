package com.marketsimulator.back_end.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.marketsimulator.back_end.dto.MarketOverviewResponse;
import com.marketsimulator.back_end.model.MarketData;
import com.marketsimulator.back_end.model.Symbol;
import com.marketsimulator.back_end.repository.MarketDataRepository;
import com.marketsimulator.back_end.repository.SymbolRepository;

@Service
public class MarketOverviewService {
	private final MarketDataRepository marketRepository;
	private final SymbolRepository symbolRepository;

	public MarketOverviewService(MarketDataRepository marketRepository, SymbolRepository symbolRepository) {
		this.marketRepository = marketRepository;
		this.symbolRepository = symbolRepository;
	}

	public List<MarketOverviewResponse> getOverview(Integer limit) {
		List<Symbol> symbols = symbolRepository.findAll();
		Map<String, Long> counts = marketRepository.countBySymbol().stream()
			.collect(Collectors.toMap(entry -> entry.getSymbol().toUpperCase(), entry -> entry.getTotal()));

		return symbols.stream()
			.map(symbol -> buildResponse(symbol, counts))
			.toList();
	}

	private MarketOverviewResponse buildResponse(Symbol symbol, Map<String, Long> counts) {
		String ticker = symbol.getTicker();
		long total = counts.getOrDefault(ticker.toUpperCase(), 0L);
		MarketData latest = marketRepository.findLatestBySymbol(ticker)
			.orElseGet(() -> marketRepository.findTopBySymbol_TickerOrderByDateDesc(ticker).orElse(null));
		return new MarketOverviewResponse(
			ticker,
			symbol.getName(),
			total,
			latest != null ? latest.getDate() : null,
			latest != null ? latest.getClose() : null
		);
	}
}
