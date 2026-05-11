package com.marketsimulator.back_end.service;

import java.net.URLEncoder;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
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

import org.springframework.http.HttpHeaders;

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
	public List<MarketSymbolResponse> getMarketData(List<String> symbols, int days) {
		List<MarketSymbolResponse> responses = new ArrayList<>();
		LocalDate today = LocalDate.now();
		Instant now = Instant.now();
		LocalDate startDate = today.minusDays(days - 1L);

		for (String symbol : symbols) {
			String ticker = symbol.trim().toUpperCase();
			Symbol symbolEntity = symbolRepository.findByTickerIgnoreCase(ticker)
				.orElseGet(() -> symbolRepository.save(new Symbol(ticker, ticker)));

			boolean cacheValid = isCacheValid(ticker, now);
			if (!cacheValid) {
				try {
					Thread.sleep(500);
				} catch (InterruptedException e) {
					Thread.currentThread().interrupt();
				}
				List<MarketData> fresh = fetchFromYahooFinance(symbolEntity, days, now);
				upsertMarketData(fresh, now);
			}

			List<MarketData> stored = marketRepository
				.findBySymbol_TickerAndDateBetweenOrderByDateAsc(
					ticker,
					startDate,
					today
				);

			if (stored.isEmpty()) {
				List<MarketData> fresh = fetchFromYahooFinance(symbolEntity, days, now);
				upsertMarketData(fresh, now);

				stored = marketRepository
					.findBySymbol_TickerAndDateBetweenOrderByDateAsc(
						ticker,
						startDate,
						today
					);
			}

			List<MarketPoint> points = stored.stream()
				.map(item -> new MarketPoint(item.getDate(), item.getOpen(), item.getHigh(), item.getLow(),
					item.getClose(), item.getVolume()))
				.toList();

			Instant fetchedAt = marketRepository.findTopBySymbol_TickerOrderByFetchedAtDesc(ticker)
				.map(MarketData::getFetchedAt).orElse(null);

			responses.add(new MarketSymbolResponse(
				ticker,
				symbolEntity.getName(),
				cacheValid,
				fetchedAt,
				points
			));
		}

		return responses;
	}

	private boolean isCacheValid(String symbol, Instant now) {
		Optional<MarketData> latest = marketRepository.findTopBySymbol_TickerOrderByFetchedAtDesc(symbol);
		if (latest.isEmpty()) {
			return false;
		}
		Duration age = Duration.between(latest.get().getFetchedAt(), now);
		return age.toHours() < 6;
	}

	private List<MarketData> fetchFromYahooFinance(Symbol symbol, int days, Instant fetchedAt) {
		int rangeDays = Math.max(days * 2, 10);
		String encodedTicker = URLEncoder.encode(symbol.getTicker(), StandardCharsets.UTF_8);
		String url = "https://query1.finance.yahoo.com/v8/finance/chart/" + encodedTicker
			+ "?range=" + rangeDays + "d&interval=1d";
		try {
			HttpHeaders headers = new HttpHeaders();
			headers.set("User-Agent",
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

			HttpEntity<String> entity = new HttpEntity<>(headers);

			ResponseEntity<String> response = restTemplate.exchange(
				url,
				HttpMethod.GET,
				entity,
				String.class
			);

			String raw = response.getBody();
			// System.out.println(raw);
			if (raw == null) {
				return List.of();
			}
			JsonNode root = objectMapper.readTree(raw);
			JsonNode chart = root.path("chart");
			if (!chart.path("error").isNull() && !chart.path("error").isMissingNode()) {
				return List.of();
			}
			JsonNode resultNode = chart.path("result");
			if (!resultNode.isArray() || resultNode.isEmpty()) {
				return List.of();
			}
			JsonNode resultRoot = resultNode.get(0);
			JsonNode timestamps = resultRoot.path("timestamp");
			JsonNode quote = resultRoot.path("indicators").path("quote").path(0);
			JsonNode opens = quote.path("open");
			JsonNode highs = quote.path("high");
			JsonNode lows = quote.path("low");
			JsonNode closes = quote.path("close");
			JsonNode volumes = quote.path("volume");

			List<MarketData> result = new ArrayList<>();
			for (int i = 0; i < timestamps.size(); i += 1) {
				JsonNode openNode = opens.path(i);
				JsonNode highNode = highs.path(i);
				JsonNode lowNode = lows.path(i);
				JsonNode closeNode = closes.path(i);
				JsonNode volumeNode = volumes.path(i);
				if (openNode.isNull() || highNode.isNull() || lowNode.isNull() || closeNode.isNull()
					|| volumeNode.isNull()) {
					continue;
				}
				LocalDate date = Instant.ofEpochSecond(timestamps.get(i).asLong())
					.atZone(ZoneOffset.UTC)
					.toLocalDate();
				double open = openNode.asDouble();
				double high = highNode.asDouble();
				double low = lowNode.asDouble();
				double close = closeNode.asDouble();
				long volume = volumeNode.asLong();
				result.add(new MarketData(symbol, date, open, high, low, close, volume, fetchedAt));
			}

			result.sort(Comparator.comparing(MarketData::getDate));
			return result;
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new RuntimeException(
				"Yahoo Finance request failed for " + symbol.getTicker(),
				ex
			);
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
