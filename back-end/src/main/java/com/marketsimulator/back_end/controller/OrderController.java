package com.marketsimulator.back_end.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.marketsimulator.back_end.dto.OrderPreviewResponse;
import com.marketsimulator.back_end.dto.OrderRequest;
import com.marketsimulator.back_end.dto.OrderResponse;
import com.marketsimulator.back_end.service.OrderService;
import com.marketsimulator.back_end.dto.SymbolResponse;
import com.marketsimulator.back_end.service.SymbolService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class OrderController {
    private final OrderService orderService;
    private final SymbolService symbolService;

    public OrderController(OrderService orderService, SymbolService symbolService) {
        this.orderService = orderService;
        this.symbolService = symbolService;
    }

    @GetMapping("/symbols")
    public List<SymbolResponse> symbols() {
        return symbolService.getAll().stream()
            .map(s -> new SymbolResponse(s.getId(), s.getTicker(), s.getName()))
            .toList();
    }

    @PostMapping("/preview")
    public ResponseEntity<?> preview(@RequestBody OrderRequest req) {
        if (req == null || req.symbol == null || req.symbol.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Symbol is required."));
        }
        OrderPreviewResponse resp = orderService.preview(req);
        return ResponseEntity.ok(resp);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody OrderRequest req, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated."));
        }
        try {
            OrderResponse resp = orderService.create(principal.getName(), req);
            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> list(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated."));
        }
        try {
            List<OrderResponse> list = orderService.listForUser(principal.getName());
            return ResponseEntity.ok(list);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
