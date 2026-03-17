package com.marketsimulator.back_end.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.marketsimulator.back_end.model.Symbol;
import com.marketsimulator.back_end.repository.SymbolRepository;

@Service
public class SymbolService {
	private final SymbolRepository repository;

	public SymbolService(SymbolRepository repository) {
		this.repository = repository;
	}

	public List<Symbol> getAll() {
		return repository.findAll();
	}
}
