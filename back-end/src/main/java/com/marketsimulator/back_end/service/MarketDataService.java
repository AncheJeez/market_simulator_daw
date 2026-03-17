package com.marketsimulator.back_end.service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marketsimulator.back_end.dto.MarketPoint;
import com.marketsimulator.back_end.dto.MarketSymbolResponse;
import com.marketsimulator.back_end.model.MarketData;
import com.marketsimulator.back_end.model.Symbol;
import com.marketsimulator.back_end.repository.MarketDataRepository;
import com.marketsimulator.back_end.repository.SymbolRepository;

@Service
public class MarketDataService {
	private final MarketDataRepository marketRepository;
	private final SymbolRepository symbolRepository;
	private final RestTemplate restTemplate;
	private final ObjectMapper objectMapper;

	public MarketDataService(MarketDataRepository marketRepository, SymbolRepository symbolRepository,
		ObjectMapper objectMapper) {
		this.marketRepository = marketRepository;
		this.symbolRepository = symbolRepository;
		this.objectMapper = objectMapper;
		this.restTemplate = new RestTemplate();
	}

	@Transactional
	public List<MarketSymbolResponse> getMarketData(List<String> symbols, int days, String apiKey) {
		List<MarketSymbolResponse> responses = new ArrayList<>();
		LocalDate today = LocalDate.now();
		Instant now = Instant.now();
		LocalDate startDate = today.minusDays(days - 1L);

		for (String symbol : symbols) {
			Symbol symbolEntity = symbolRepository.findByTickerIgnoreCase(symbol)
				.orElseGet(() -> symbolRepository.save(new Symbol(symbol.toUpperCase(), symbol.toUpperCase())));

			boolean cacheValid = isCacheValid(symbol, today, now);
			if (!cacheValid) {
				List<MarketData> fresh = fetchFromAlphaVantage(symbolEntity, apiKey, now);
				upsertMarketData(fresh, now);
			}

			List<MarketData> stored = marketRepository.findBySymbol_TickerAndDateBetweenOrderByDateAsc(
				symbol, startDate, today);

			List<MarketPoint> points = stored.stream()
				.map(item -> new MarketPoint(item.getDate(), item.getOpen(), item.getHigh(), item.getLow(),
					item.getClose(), item.getVolume()))
				.toList();

			Instant fetchedAt = marketRepository.findTopBySymbol_TickerOrderByFetchedAtDesc(symbol)
				.map(MarketData::getFetchedAt).orElse(null);

			responses.add(new MarketSymbolResponse(
				symbol,
				symbolEntity != null ? symbolEntity.getName() : symbol,
				cacheValid,
				fetchedAt,
				points
			));
		}

		return responses;
	}

	private boolean isCacheValid(String symbol, LocalDate today, Instant now) {
		Optional<MarketData> latest = marketRepository.findTopBySymbol_TickerOrderByFetchedAtDesc(symbol);
		if (latest.isEmpty()) {
			return false;
		}
		Duration age = Duration.between(latest.get().getFetchedAt(), now);
		return age.toHours() < 24;
	}

	private List<MarketData> fetchFromAlphaVantage(Symbol symbol, String apiKey, Instant fetchedAt) {
		String url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + symbol.getTicker()
			+ "&apikey=" + apiKey;
		String raw = restTemplate.getForObject(url, String.class);
		if (raw == null) {
			return List.of();
		}
		try {
			JsonNode root = objectMapper.readTree(raw);
			if (root.has("Error Message") || root.has("Note")) {
				return List.of();
			}
			JsonNode series = root.get("Time Series (Daily)");
			if (series == null || !series.isObject()) {
				return List.of();
			}

			List<MarketData> result = new ArrayList<>();
			series.fields().forEachRemaining(entry -> {
				String dateStr = entry.getKey();
				JsonNode values = entry.getValue();
				LocalDate date = LocalDate.parse(dateStr);
				double open = values.get("1. open").asDouble();
				double high = values.get("2. high").asDouble();
				double low = values.get("3. low").asDouble();
				double close = values.get("4. close").asDouble();
				long volume = values.get("5. volume").asLong();
				result.add(new MarketData(symbol, date, open, high, low, close, volume, fetchedAt));
			});

			result.sort(Comparator.comparing(MarketData::getDate));
			return result;
		} catch (Exception ex) {
			return List.of();
		}
	}

	private void upsertMarketData(List<MarketData> fresh, Instant fetchedAt) {
		for (MarketData item : fresh) {
			Optional<MarketData> existing = marketRepository.findBySymbol_TickerAndDate(
				item.getSymbol().getTicker(), item.getDate());
			if (existing.isPresent()) {
				existing.get().update(item.getOpen(), item.getHigh(), item.getLow(), item.getClose(), item.getVolume(), fetchedAt);
				marketRepository.save(existing.get());
			} else {
				marketRepository.save(item);
			}
		}
	}
}
