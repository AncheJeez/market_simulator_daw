package com.marketsimulator.back_end.model;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "market_data", uniqueConstraints = @UniqueConstraint(columnNames = { "symbol", "date" }))
public class MarketData {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "symbol", referencedColumnName = "ticker", nullable = false)
	private Symbol symbol;

	@Column(nullable = false)
	private LocalDate date;

	@Column(nullable = false)
	private double open;

	@Column(nullable = false)
	private double high;

	@Column(nullable = false)
	private double low;

	@Column(nullable = false)
	private double close;

	@Column(nullable = false)
	private long volume;

	@Column(name = "fetched_at", nullable = false)
	private Instant fetchedAt;

	protected MarketData() {
	}

	public MarketData(Symbol symbol, LocalDate date, double open, double high, double low, double close, long volume,
		Instant fetchedAt) {
		this.symbol = symbol;
		this.date = date;
		this.open = open;
		this.high = high;
		this.low = low;
		this.close = close;
		this.volume = volume;
		this.fetchedAt = fetchedAt;
	}

	public Long getId() {
		return id;
	}

	public Symbol getSymbol() {
		return symbol;
	}

	public LocalDate getDate() {
		return date;
	}

	public double getOpen() {
		return open;
	}

	public double getHigh() {
		return high;
	}

	public double getLow() {
		return low;
	}

	public double getClose() {
		return close;
	}

	public long getVolume() {
		return volume;
	}

	public Instant getFetchedAt() {
		return fetchedAt;
	}

	public void update(double open, double high, double low, double close, long volume, Instant fetchedAt) {
		this.open = open;
		this.high = high;
		this.low = low;
		this.close = close;
		this.volume = volume;
		this.fetchedAt = fetchedAt;
	}
}
