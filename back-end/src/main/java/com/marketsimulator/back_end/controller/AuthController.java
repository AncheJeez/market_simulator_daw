package com.marketsimulator.back_end.controller;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.marketsimulator.back_end.dto.AuthRequest;
import com.marketsimulator.back_end.dto.UserResponse;
import com.marketsimulator.back_end.exception.DuplicateUserException;
import com.marketsimulator.back_end.exception.InvalidUserInputException;
import com.marketsimulator.back_end.exception.StorageException;
import com.marketsimulator.back_end.model.UserType;
import com.marketsimulator.back_end.repository.UserAccountRepository;
import com.marketsimulator.back_end.service.UserAccountService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
	private final UserAccountService service;
	private final UserAccountRepository repository;
	private final AuthenticationManager authenticationManager;

	public AuthController(UserAccountService service, UserAccountRepository repository,
		AuthenticationManager authenticationManager) {
		this.service = service;
		this.repository = repository;
		this.authenticationManager = authenticationManager;
	}

	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestParam("firstName") String firstName,
		@RequestParam("secondName") String secondName,
		@RequestParam("userName") String userName,
		@RequestParam("userType") UserType userType,
		@RequestParam("password") String password,
		@RequestParam("profilePicture") MultipartFile profilePicture) {
		if (isBlank(firstName) || isBlank(secondName) || isBlank(userName) || isBlank(password)) {
			return ResponseEntity.badRequest().body(Map.of("message", "All fields are required."));
		}
		try {
			var created = service.register(firstName.trim(), secondName.trim(), userName.trim(), userType,
				password, profilePicture);
			return ResponseEntity.status(HttpStatus.CREATED)
				.body(new UserResponse(created.getId(), created.getUserName(), created.getFirstName(),
					created.getSecondName(), created.getUserType().name(), created.getProfilePicturePath()));
		} catch (DuplicateUserException ex) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
		} catch (InvalidUserInputException ex) {
			return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
		} catch (StorageException ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(Map.of("message", ex.getMessage()));
		}
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@org.springframework.web.bind.annotation.RequestBody AuthRequest request,
		HttpServletRequest httpRequest) {
		if (request.userName() == null || request.userName().isBlank() || request.password() == null
			|| request.password().isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("message", "User name and password are required."));
		}
		try {
			Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.userName().trim(), request.password()));
			SecurityContextHolder.getContext().setAuthentication(authentication);
			HttpSession session = httpRequest.getSession(true);
			session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(Map.of("message", "Invalid credentials."));
		}
		return repository.findByUserName(request.userName().trim())
			.<ResponseEntity<?>>map(user -> ResponseEntity.ok(new UserResponse(user.getId(), user.getUserName(),
				user.getFirstName(), user.getSecondName(), user.getUserType().name(), user.getProfilePicturePath())))
			.orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(Map.of("message", "Invalid credentials.")));
	}

	@PostMapping("/logout")
	public ResponseEntity<?> logout(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.invalidate();
		}
		SecurityContextHolder.clearContext();
		return ResponseEntity.ok(Map.of("message", "Logged out."));
	}

	@GetMapping("/me")
	public ResponseEntity<?> me() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()
			|| "anonymousUser".equals(authentication.getPrincipal())) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		String userName = authentication.getName();
		return repository.findByUserName(userName)
			.<ResponseEntity<?>>map(user -> ResponseEntity.ok(new UserResponse(user.getId(), user.getUserName(),
				user.getFirstName(), user.getSecondName(), user.getUserType().name(), user.getProfilePicturePath())))
			.orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
	}

	private boolean isBlank(String value) {
		return value == null || value.isBlank();
	}
}
