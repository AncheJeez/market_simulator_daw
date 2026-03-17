package com.marketsimulator.back_end.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "symbol")
public class Symbol {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 20)
	private String ticker;

	@Column(nullable = false, length = 120)
	private String name;

	protected Symbol() {
	}

	public Symbol(String ticker, String name) {
		this.ticker = ticker;
		this.name = name;
	}

	public Long getId() {
		return id;
	}

	public String getTicker() {
		return ticker;
	}

	public String getName() {
		return name;
	}

	public void setTicker(String ticker) {
		this.ticker = ticker;
	}

	public void setName(String name) {
		this.name = name;
	}
}
