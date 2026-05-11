package com.marketsimulator.back_end.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marketsimulator.back_end.model.Order;
import com.marketsimulator.back_end.model.UserAccount;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(UserAccount user);
}
