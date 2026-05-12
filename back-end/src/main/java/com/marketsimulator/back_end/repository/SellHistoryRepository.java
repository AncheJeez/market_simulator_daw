package com.marketsimulator.back_end.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marketsimulator.back_end.model.SellHistory;
import com.marketsimulator.back_end.model.UserAccount;

public interface SellHistoryRepository extends JpaRepository<SellHistory, Long> {
    List<SellHistory> findByUserOrderByCreatedAtDesc(UserAccount user);
}
