package com.marketsimulator.back_end.user;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
	private final UserAccountService service;

	public AuthController(UserAccountService service) {
		this.service = service;
	}

	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody AuthRequest request) {
		if (request.name() == null || request.name().isBlank() || request.password() == null
			|| request.password().isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("message", "Name and password are required."));
		}
		try {
			UserAccount created = service.register(request.name().trim(), request.password());
			return ResponseEntity.status(HttpStatus.CREATED)
				.body(new UserResponse(created.getId(), created.getName()));
		} catch (UserAccountService.DuplicateUserException ex) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
		}
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody AuthRequest request) {
		if (request.name() == null || request.name().isBlank() || request.password() == null
			|| request.password().isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("message", "Name and password are required."));
		}
		return service.authenticate(request.name().trim(), request.password())
			.<ResponseEntity<?>>map(user -> ResponseEntity.ok(new UserResponse(user.getId(), user.getName())))
			.orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(Map.of("message", "Invalid credentials.")));
	}

	public record AuthRequest(String name, String password) {
	}

	public record UserResponse(Long id, String name) {
	}
}
