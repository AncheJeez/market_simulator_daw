package com.marketsimulator.back_end.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.marketsimulator.back_end.model.UserAccount;
import com.marketsimulator.back_end.repository.UserAccountRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {
	private final UserAccountRepository repository;

	public CustomUserDetailsService(UserAccountRepository repository) {
		this.repository = repository;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		UserAccount account = repository.findByUserName(username)
			.orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
		return new User(account.getUserName(), account.getPasswordHash(), account.getAuthorities());
	}
}
