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
			// TECNOLOGÍA Y SEMICONDUCTORES
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
			new Symbol("ASML", "ASML Holding N.V."),
			new Symbol("MU", "Micron Technology, Inc."),
			new Symbol("AMAT", "Applied Materials, Inc."),
			new Symbol("LRCX", "Lam Research Corporation"),
			new Symbol("PANW", "Palo Alto Networks, Inc."),
			new Symbol("SNPS", "Synopsys, Inc."),
			new Symbol("CDNS", "Cadence Design Systems, Inc."),

			// FINANZAS Y BANCA
			new Symbol("JPM", "JPMorgan Chase & Co."),
			new Symbol("BAC", "Bank of America Corporation"),
			new Symbol("WFC", "Wells Fargo & Company"),
			new Symbol("C", "Citigroup Inc."),
			new Symbol("MS", "Morgan Stanley"),
			new Symbol("GS", "The Goldman Sachs Group, Inc."),
			new Symbol("V", "Visa Inc."),
			new Symbol("MA", "Mastercard Incorporated"),
			new Symbol("PYPL", "PayPal Holdings, Inc."),
			new Symbol("AXP", "American Express Company"),
			new Symbol("BLK", "BlackRock, Inc."),
			new Symbol("HSBC", "HSBC Holdings plc"),
			new Symbol("RY", "Royal Bank of Canada"),
			new Symbol("BRK-B", "Berkshire Hathaway Inc."),

			// CONSUMO Y RETAIL
			new Symbol("WMT", "Walmart Inc."),
			new Symbol("HD", "The Home Depot, Inc."),
			new Symbol("COST", "Costco Wholesale Corporation"),
			new Symbol("TGT", "Target Corporation"),
			new Symbol("LOW", "Lowe's Companies, Inc."),
			new Symbol("NKE", "NIKE, Inc."),
			new Symbol("SBUX", "Starbucks Corporation"),
			new Symbol("MCD", "McDonald's Corporation"),
			new Symbol("KO", "The Coca-Cola Company"),
			new Symbol("PEP", "PepsiCo, Inc."),
			new Symbol("PG", "Procter & Gamble Company"),
			new Symbol("EL", "The Estée Lauder Companies Inc."),
			new Symbol("UL", "Unilever PLC"),
			new Symbol("OR.PA", "L'Oréal S.A."),
			new Symbol("NSRGY", "Nestlé S.A."),

			// SALUD Y FARMACÉUTICAS
			new Symbol("JNJ", "Johnson & Johnson"),
			new Symbol("PFE", "Pfizer Inc."),
			new Symbol("MRK", "Merck & Co., Inc."),
			new Symbol("ABBV", "AbbVie Inc."),
			new Symbol("LLY", "Eli Lilly and Company"),
			new Symbol("UNH", "UnitedHealth Group Incorporated"),
			new Symbol("CVS", "CVS Health Corporation"),
			new Symbol("TMO", "Thermo Fisher Scientific Inc."),
			new Symbol("ABT", "Abbott Laboratories"),
			new Symbol("DHR", "Danaher Corporation"),
			new Symbol("BMY", "Bristol-Myers Squibb Company"),
			new Symbol("AMGN", "Amgen Inc."),
			new Symbol("GILD", "Gilead Sciences, Inc."),

			// ENERGÍA E INDUSTRIA
			new Symbol("XOM", "Exxon Mobil Corporation"),
			new Symbol("CVX", "Chevron Corporation"),
			new Symbol("SHEL", "Shell plc"),
			new Symbol("TTE", "TotalEnergies SE"),
			new Symbol("BP", "BP p.l.c."),
			new Symbol("CAT", "Caterpillar Inc."),
			new Symbol("GE", "General Electric Company"),
			new Symbol("BA", "The Boeing Company"),
			new Symbol("HON", "Honeywell International Inc."),
			new Symbol("LMT", "Lockheed Martin Corporation"),
			new Symbol("UPS", "United Parcel Service, Inc."),
			new Symbol("FDX", "FedEx Corporation"),
			new Symbol("DE", "Deere & Company"),
			new Symbol("MMM", "3M Company"),

			// COMUNICACIONES Y ENTRETENIMIENTO
			new Symbol("DIS", "The Walt Disney Company"),
			new Symbol("VZ", "Verizon Communications Inc."),
			new Symbol("T", "AT&T Inc."),
			new Symbol("CMCSA", "Comcast Corporation"),
			new Symbol("TMUS", "T-Mobile US, Inc."),
			new Symbol("SONY", "Sony Group Corporation"),
			new Symbol("SPOT", "Spotify Technology S.A."),

			// AUTOMOTRIZ Y OTROS
			new Symbol("TM", "Toyota Motor Corporation"),
			new Symbol("F", "Ford Motor Company"),
			new Symbol("GM", "General Motors Company"),
			new Symbol("HMC", "Honda Motor Co., Ltd."),
			new Symbol("RACE", "Ferrari N.V."),
			new Symbol("AIR.PA", "Airbus SE"),

			// ÍNDICES Y ETFS
			new Symbol("SPY", "SPDR S&P 500 ETF Trust"),
			new Symbol("QQQ", "Invesco QQQ Trust"),
			new Symbol("DIA", "SPDR Dow Jones Industrial Average ETF"),
			new Symbol("IWM", "iShares Russell 2000 ETF"),
			new Symbol("BTC-USD", "Bitcoin USD")
		));
	}
}
