package com.marketsimulator.back_end.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marketsimulator.back_end.model.Symbol;

public interface SymbolRepository extends JpaRepository<Symbol, Long> {
	Optional<Symbol> findByTickerIgnoreCase(String ticker);
}
