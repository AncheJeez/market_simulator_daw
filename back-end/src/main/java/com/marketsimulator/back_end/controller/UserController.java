package com.marketsimulator.back_end.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.marketsimulator.back_end.dto.UserResponse;
import com.marketsimulator.back_end.exception.InvalidUserInputException;
import com.marketsimulator.back_end.exception.StorageException;
import com.marketsimulator.back_end.repository.UserAccountRepository;
import com.marketsimulator.back_end.service.UserAccountService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
	private final UserAccountRepository repository;
	private final UserAccountService service;

	public UserController(UserAccountRepository repository, UserAccountService service) {
		this.repository = repository;
		this.service = service;
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable Long id) {
		return repository.findById(id)
			.<ResponseEntity<?>>map(user -> ResponseEntity.ok(new UserResponse(user.getId(),
				user.getUserName(), user.getFirstName(), user.getSecondName(), user.getUserType().name(),
				user.getProfilePicturePath())))
			.orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(Map.of("message", "User not found.")));
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> updateProfile(@PathVariable Long id,
		@RequestParam("firstName") String firstName,
		@RequestParam("secondName") String secondName,
		@RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture) {
		try {
			var updated = service.updateProfile(id, firstName, secondName, profilePicture);
			return ResponseEntity.ok(new UserResponse(updated.getId(), updated.getUserName(),
				updated.getFirstName(), updated.getSecondName(), updated.getUserType().name(),
				updated.getProfilePicturePath()));
		} catch (InvalidUserInputException ex) {
			return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
		} catch (StorageException ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(Map.of("message", ex.getMessage()));
		}
	}
}
