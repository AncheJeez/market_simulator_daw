package com.marketsimulator.back_end.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.marketsimulator.back_end.model.MarketData;

public interface MarketDataRepository extends JpaRepository<MarketData, Long> {
	java.util.List<MarketData> findBySymbol_TickerAndDateBetweenOrderByDateAsc(String symbol,
		java.time.LocalDate start, java.time.LocalDate end);
	Optional<MarketData> findBySymbol_TickerAndDate(String symbol, java.time.LocalDate date);
	Optional<MarketData> findTopBySymbol_TickerOrderByFetchedAtDesc(String symbol);
	Optional<MarketData> findTopBySymbol_TickerOrderByDateDesc(String symbol);
	java.util.List<MarketData> findBySymbol_TickerOrderByDateDesc(String symbol);
	java.util.List<MarketData> findBySymbol_TickerOrderByDateDesc(String symbol, Pageable pageable);

	@Query("""
		select md from MarketData md
		where md.symbol.ticker = :symbol
		and md.date = (select max(m2.date) from MarketData m2 where m2.symbol.ticker = :symbol)
	""")
	Optional<MarketData> findLatestBySymbol(@Param("symbol") String symbol);

	@Query("select md.symbol.ticker as symbol, max(md.fetchedAt) as fetchedAt from MarketData md group by md.symbol.ticker")
	java.util.List<SymbolFetchedAt> findLastFetchedPerSymbol();

	@Query("select md.symbol.ticker as symbol, count(md) as total from MarketData md group by md.symbol.ticker")
	java.util.List<SymbolCount> countBySymbol();

	interface SymbolFetchedAt {
		String getSymbol();
		java.time.Instant getFetchedAt();
	}

	interface SymbolCount {
		String getSymbol();
		long getTotal();
	}
}
