package com.marketsimulator.back_end.controller;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
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
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {
	private final UserAccountService service;
	private final UserAccountRepository repository;
	private final AuthenticationManager authenticationManager;
	private final SecurityContextRepository securityContextRepository;

	public AuthController(UserAccountService service, UserAccountRepository repository,
		AuthenticationManager authenticationManager, SecurityContextRepository securityContextRepository) {
		this.service = service;
		this.repository = repository;
		this.authenticationManager = authenticationManager;
		this.securityContextRepository = securityContextRepository;
	}

	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestParam("firstName") String firstName,
		@RequestParam("email") String email,
		@RequestParam("bornDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bornDate,
		@RequestParam("secondName") String secondName,
		@RequestParam("userName") String userName,
		@RequestParam("userType") UserType userType,
		@RequestParam("password") String password,
		@RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture) {
		if (isBlank(firstName) || isBlank(secondName) || isBlank(userName) || isBlank(email) || isBlank(password)) {
			return ResponseEntity.badRequest().body(Map.of("message", "All fields are required."));
		}
		try {
			var created = service.register(firstName.trim(), secondName.trim(), userName.trim(), email.trim(), bornDate, userType,
				password, profilePicture);
			return ResponseEntity.status(HttpStatus.CREATED)
				.body(new UserResponse(created.getId(), created.getUserName(), created.getFirstName(),
					created.getSecondName(), created.getEmail(), created.getBornDate(), created.getUserType().name(), created.getProfilePicturePath()));
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
	public ResponseEntity<?> login(@RequestBody AuthRequest request,
		HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
		if (request.userName() == null || request.userName().isBlank() || request.password() == null
			|| request.password().isBlank()) {
			return ResponseEntity.badRequest().body(Map.of("message", "User name and password are required."));
		}
		try {
			Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.userName().trim(), request.password()));
			
			SecurityContext context = SecurityContextHolder.createEmptyContext();
			context.setAuthentication(authentication);
			SecurityContextHolder.setContext(context);
			securityContextRepository.saveContext(context, httpRequest, httpResponse);
			
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(Map.of("message", "Invalid credentials."));
		}
		return repository.findByUserName(request.userName().trim())
			.<ResponseEntity<?>>map(user -> ResponseEntity.ok(new UserResponse(user.getId(), user.getUserName(),
				user.getFirstName(), user.getSecondName(), user.getEmail(), user.getBornDate(), user.getUserType().name(), user.getProfilePicturePath())))
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
				user.getFirstName(), user.getSecondName(), user.getEmail(), user.getBornDate(), user.getUserType().name(), user.getProfilePicturePath())))
			.orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
	}

	private boolean isBlank(String value) {
		return value == null || value.isBlank();
	}
}
