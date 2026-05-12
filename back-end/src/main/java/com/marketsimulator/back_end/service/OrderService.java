package com.marketsimulator.back_end.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.ZoneId;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marketsimulator.back_end.dto.OrderPreviewResponse;
import com.marketsimulator.back_end.dto.OrderRequest;
import com.marketsimulator.back_end.dto.OrderResponse;
import com.marketsimulator.back_end.model.MarketData;
import com.marketsimulator.back_end.model.Order;
import com.marketsimulator.back_end.model.Symbol;
import com.marketsimulator.back_end.model.UserAccount;
import com.marketsimulator.back_end.model.SellHistory;
import com.marketsimulator.back_end.repository.MarketDataRepository;
import com.marketsimulator.back_end.repository.OrderRepository;
import com.marketsimulator.back_end.repository.SymbolRepository;
import com.marketsimulator.back_end.repository.UserAccountRepository;
import com.marketsimulator.back_end.repository.SellHistoryRepository;
import com.marketsimulator.back_end.dto.SellHistoryResponse;

@Service
public class OrderService {
    private final SymbolRepository symbolRepository;
    private final MarketDataRepository marketRepository;
    private final UserAccountRepository userRepository;
    private final OrderRepository orderRepository;
    private final SellHistoryRepository sellRepository;

    public OrderService(SymbolRepository symbolRepository, MarketDataRepository marketRepository,
                        UserAccountRepository userRepository, OrderRepository orderRepository, SellHistoryRepository sellRepository) {
        this.symbolRepository = symbolRepository;
        this.marketRepository = marketRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.sellRepository = sellRepository;
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

    @Transactional
    public OrderResponse sell(String username, Long orderId) {
        UserAccount user = userRepository.findByUserName(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found."));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Order not found.");
        }
        if (!"FILLED".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalArgumentException("Order is not open for selling.");
        }
        LocalDate createdDate = order.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate today = LocalDate.now(ZoneId.systemDefault());
        if (createdDate.equals(today)) {
            throw new IllegalArgumentException("Cannot sell on the same day as purchase.");
        }
        String ticker = order.getSymbol().getTicker();
        MarketData latest = marketRepository.findLatestBySymbol(ticker)
            .orElseThrow(() -> new IllegalArgumentException("Market data unavailable for " + ticker));
        double priceNow = latest.getClose();
        double quantity = order.getQuantity() == null ? 0.0 : order.getQuantity();
        long proceeds = Math.round(priceNow * quantity);
        user.setCurrency(user.getCurrency() + proceeds);
        userRepository.save(user);
        order.setStatus("CLOSED");
        orderRepository.save(order);
        // record sell history
        SellHistory sh = new SellHistory(user, ticker, priceNow, quantity, proceeds, java.time.Instant.now());
        sellRepository.save(sh);
        return new OrderResponse(order.getId(), order.getSymbol().getTicker(), order.getStatus(), order.getOrderType(), order.getPrice(), order.getQuantity(), order.getTimeInForce(), order.getCreatedAt());
    }

    public java.util.List<SellHistoryResponse> listSellHistoryForUser(String username) {
        UserAccount user = userRepository.findByUserName(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found."));
        return sellRepository.findByUserOrderByCreatedAtDesc(user).stream()
            .map(s -> new SellHistoryResponse(s.getId(), s.getSymbol(), s.getPrice(), s.getQuantity(), s.getProceeds(), s.getCreatedAt()))
            .toList();
    }
}
