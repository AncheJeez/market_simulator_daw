package com.marketsimulator.back_end.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marketsimulator.back_end.dto.OrderPreviewResponse;
import com.marketsimulator.back_end.dto.OrderRequest;
import com.marketsimulator.back_end.dto.OrderResponse;
import com.marketsimulator.back_end.model.MarketData;
import com.marketsimulator.back_end.model.Order;
import com.marketsimulator.back_end.model.Symbol;
import com.marketsimulator.back_end.model.UserAccount;
import com.marketsimulator.back_end.repository.MarketDataRepository;
import com.marketsimulator.back_end.repository.OrderRepository;
import com.marketsimulator.back_end.repository.SymbolRepository;
import com.marketsimulator.back_end.repository.UserAccountRepository;

@Service
public class OrderService {
    private final SymbolRepository symbolRepository;
    private final MarketDataRepository marketRepository;
    private final UserAccountRepository userRepository;
    private final OrderRepository orderRepository;

    public OrderService(SymbolRepository symbolRepository, MarketDataRepository marketRepository,
                        UserAccountRepository userRepository, OrderRepository orderRepository) {
        this.symbolRepository = symbolRepository;
        this.marketRepository = marketRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    public OrderPreviewResponse preview(OrderRequest req) {
        String ticker = req.symbol.trim().toUpperCase();
        Optional<MarketData> latest = marketRepository.findLatestBySymbol(ticker);
        double price = latest.map(MarketData::getClose).orElse(0.0);
        if (req.price != null && req.price > 0) {
            price = req.price;
        }
        double quantity = 0.0;
        if (price > 0 && req.investAmount != null) {
            quantity = (double) req.investAmount / price;
        }
        return new OrderPreviewResponse(ticker, price, req.investAmount == null ? 0L : req.investAmount, quantity);
    }

    // @Transactional
    // public OrderResponse create(String username, OrderRequest req) {
    //     UserAccount user = userRepository.findByUserName(username)
    //         .orElseThrow(() -> new IllegalArgumentException("User not found."));
    //     String ticker = req.symbol.trim().toUpperCase();
    //     Symbol symbol = symbolRepository.findByTickerIgnoreCase(ticker)
    //         .orElseGet(() -> symbolRepository.save(new Symbol(ticker, ticker)));
    //     Optional<MarketData> latest = marketRepository.findLatestBySymbol(ticker);
    //     double price = latest.map(MarketData::getClose).orElse(req.price != null ? req.price : 0.0);
    //     double quantity = 0.0;
    //     if (price > 0 && req.investAmount != null) {
    //         quantity = (double) req.investAmount / price;
    //     }
    //     Order order = new Order(user, symbol, "PENDING", req.orderType != null ? req.orderType : "Market",
    //         req.price, quantity > 0 ? quantity : null, req.timeInForce);
    //     Order saved = orderRepository.save(order);
    //     return new OrderResponse(saved.getId(), saved.getSymbol().getTicker(), saved.getStatus(), saved.getOrderType(), saved.getPrice(), saved.getQuantity(), saved.getTimeInForce(), saved.getCreatedAt());
    // }

    @Transactional
    public OrderResponse create(String username, OrderRequest req) {
        UserAccount user = userRepository.findByUserName(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));
        
        String ticker = req.symbol.trim().toUpperCase();
        Symbol symbol = symbolRepository.findByTickerIgnoreCase(ticker)
            .orElseGet(() -> symbolRepository.save(new Symbol(ticker, ticker)));

        Optional<MarketData> latest = marketRepository.findLatestBySymbol(ticker);
        double marketPrice = latest.map(MarketData::getClose)
            .orElseThrow(() -> new IllegalArgumentException("Market data unavailable for " + ticker));

        double executionPrice = ("Limit".equalsIgnoreCase(req.orderType) && req.price != null) 
                                ? req.price 
                                : marketPrice;

        if (req.investAmount == null || req.investAmount <= 0) {
            throw new IllegalArgumentException("Investment amount must be > 0");
        }

        long totalCost = req.investAmount; 
        double quantity = (double) totalCost / executionPrice;

        if (user.getCurrency() < totalCost) {
            throw new IllegalArgumentException("Insufficient balance. You have $" + user.getCurrency() + 
                                            " but need $" + totalCost);
        }

        user.setCurrency(user.getCurrency() - totalCost);
        userRepository.save(user);

        String status = "Market".equalsIgnoreCase(req.orderType) ? "FILLED" : "PENDING";

        Order order = new Order(
            user, 
            symbol, 
            status, 
            req.orderType != null ? req.orderType : "Market",
            executionPrice, 
            quantity, 
            req.timeInForce
        );

        Order saved = orderRepository.save(order);

        return new OrderResponse(
            saved.getId(), 
            saved.getSymbol().getTicker(), 
            saved.getStatus(), 
            saved.getOrderType(), 
            saved.getPrice(), 
            saved.getQuantity(), 
            saved.getTimeInForce(), 
            saved.getCreatedAt()
        );
    }

    public List<OrderResponse> listForUser(String username) {
        UserAccount user = userRepository.findByUserName(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));
        return orderRepository.findByUserOrderByCreatedAtDesc(user).stream()
            .map(o -> new OrderResponse(o.getId(), o.getSymbol().getTicker(), o.getStatus(), o.getOrderType(), o.getPrice(), o.getQuantity(), o.getTimeInForce(), o.getCreatedAt()))
            .collect(Collectors.toList());
    }
}
