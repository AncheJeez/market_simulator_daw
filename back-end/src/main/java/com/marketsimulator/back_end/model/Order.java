package com.marketsimulator.back_end.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_order")
public class Order {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id")
	private UserAccount user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "symbol", referencedColumnName = "ticker")
	private Symbol symbol;

	@Column(name = "status", length = 30, nullable = false)
	private String status;

	@Column(name = "order_type", length = 30, nullable = false)
	private String orderType;

	@Column(name = "price")
	private Double price;

	@Column(name = "quantity")
	private Double quantity;

	@Column(name = "time_in_force", length = 20)
	private String timeInForce;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt = Instant.now();

	protected Order() {
	}

	public Order(UserAccount user, Symbol symbol, String status, String orderType, Double price, Double quantity,
		String timeInForce) {
		this.user = user;
		this.symbol = symbol;
		this.status = status;
		this.orderType = orderType;
		this.price = price;
		this.quantity = quantity;
		this.timeInForce = timeInForce;
	}

	public Long getId() {
		return id;
	}

	public UserAccount getUser() {
		return user;
	}

	public Symbol getSymbol() {
		return symbol;
	}

	public String getStatus() {
		return status;
	}

	public String getOrderType() {
		return orderType;
	}

	public Double getPrice() {
		return price;
	}

	public Double getQuantity() {
		return quantity;
	}

	public String getTimeInForce() {
		return timeInForce;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public void setPrice(Double price) {
		this.price = price;
	}

	public void setQuantity(Double quantity) {
		this.quantity = quantity;
	}
}
