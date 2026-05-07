package com.marketsimulator.back_end.service;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.marketsimulator.back_end.model.Symbol;
import com.marketsimulator.back_end.repository.SymbolRepository;

@Component
public class SymbolSeeder implements CommandLineRunner {
	private final SymbolRepository repository;

	public SymbolSeeder(SymbolRepository repository) {
		this.repository = repository;
	}

	@Override
	public void run(String... args) {
		if (repository.count() > 0) {
			return;
		}

		repository.saveAll(List.of(
			new Symbol("AAPL", "Apple Inc."),
			new Symbol("MSFT", "Microsoft Corporation"),
			new Symbol("GOOGL", "Alphabet Inc."),
			new Symbol("AMZN", "Amazon.com, Inc."),
			new Symbol("NVDA", "NVIDIA Corporation"),
			new Symbol("META", "Meta Platforms, Inc."),
			new Symbol("TSLA", "Tesla, Inc."),
			new Symbol("ORCL", "Oracle Corporation"),
			new Symbol("INTC", "Intel Corporation"),
			new Symbol("AMD", "Advanced Micro Devices, Inc."),
			new Symbol("NFLX", "Netflix, Inc."),
			new Symbol("ADBE", "Adobe Inc."),
			new Symbol("CSCO", "Cisco Systems, Inc."),
			new Symbol("CRM", "Salesforce, Inc."),
			new Symbol("QCOM", "QUALCOMM Incorporated"),
			new Symbol("AVGO", "Broadcom Inc."),
			new Symbol("TXN", "Texas Instruments Incorporated"),
			new Symbol("IBM", "International Business Machines"),
			new Symbol("JPM", "JPMorgan Chase & Co."),
			new Symbol("BAC", "Bank of America Corporation")
		));
	}
}
