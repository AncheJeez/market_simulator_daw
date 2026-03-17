package com.marketsimulator.back_end.user;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserAccountService {
	private final UserAccountRepository repository;
	private final PasswordEncoder passwordEncoder;

	public UserAccountService(UserAccountRepository repository, PasswordEncoder passwordEncoder) {
		this.repository = repository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional
	public UserAccount register(String name, String rawPassword) {
		if (repository.existsByName(name)) {
			throw new DuplicateUserException("User name already exists.");
		}
		String passwordHash = passwordEncoder.encode(rawPassword);
		UserAccount user = new UserAccount(name, passwordHash);
		return repository.save(user);
	}

	public Optional<UserAccount> authenticate(String name, String rawPassword) {
		return repository.findByName(name)
			.filter(user -> passwordEncoder.matches(rawPassword, user.getPasswordHash()));
	}

	public static class DuplicateUserException extends RuntimeException {
		public DuplicateUserException(String message) {
			super(message);
		}
	}
}
