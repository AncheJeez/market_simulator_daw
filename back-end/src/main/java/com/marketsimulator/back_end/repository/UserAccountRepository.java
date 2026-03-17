package com.marketsimulator.back_end.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marketsimulator.back_end.model.UserAccount;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
	Optional<UserAccount> findByUserName(String userName);
	boolean existsByUserName(String userName);
}
