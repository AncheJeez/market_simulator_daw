package com.marketsimulator.back_end.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.marketsimulator.back_end.dto.UserResponse;
import com.marketsimulator.back_end.exception.DuplicateUserException;
import com.marketsimulator.back_end.exception.InvalidUserInputException;
import com.marketsimulator.back_end.exception.StorageException;
import com.marketsimulator.back_end.model.UserType;
import com.marketsimulator.back_end.repository.UserAccountRepository;
import com.marketsimulator.back_end.service.UserAccountService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {
	private final UserAccountRepository repository;
	private final UserAccountService service;

	public UserController(UserAccountRepository repository, UserAccountService service) {
		this.repository = repository;
		this.service = service;
	}

	@GetMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<List<UserResponse>> getAll() {
		return ResponseEntity.ok(service.getAllUsers());
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable Long id) {
		return repository.findById(id)
			.<ResponseEntity<?>>map(user -> ResponseEntity.ok(new UserResponse(user.getId(),
				user.getUserName(), user.getFirstName(), user.getSecondName(), user.getEmail(), user.getBornDate(),
				user.getUserType().name(), user.getCurrency(), user.getProfilePicturePath())))
			.orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(Map.of("message", "User not found.")));
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> updateProfile(@PathVariable Long id,
		@RequestParam("firstName") String firstName,
		@RequestParam("secondName") String secondName,
		@RequestParam("email") String email,
		@RequestParam("bornDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bornDate,
		@RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture) {
		try {
			var updated = service.updateProfile(id, firstName, secondName, email, bornDate, profilePicture);
			return ResponseEntity.ok(new UserResponse(updated.getId(), updated.getUserName(),
				updated.getFirstName(), updated.getSecondName(), updated.getEmail(), updated.getBornDate(),
				updated.getUserType().name(), updated.getProfilePicturePath()));
		} catch (InvalidUserInputException ex) {
			return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
		} catch (StorageException ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(Map.of("message", ex.getMessage()));
		}
	}

	@PutMapping("/{id}/admin")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> adminUpdate(@PathVariable Long id,
		@RequestParam(value = "firstName", required = false) String firstName,
		@RequestParam(value = "secondName", required = false) String secondName,
		@RequestParam(value = "userName", required = false) String userName,
		@RequestParam(value = "email", required = false) String email,
		@RequestParam(value = "bornDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bornDate,
		@RequestParam(value = "userType", required = false) String userType,
		@RequestParam(value = "currentPassword", required = false) String currentPassword,
		@RequestParam(value = "newPassword", required = false) String newPassword,
		@RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture) {
		try {
			UserType type = userType != null ? UserType.valueOf(userType) : null;
			var updated = service.adminUpdateUser(id, firstName, secondName, userName, email, bornDate, type,
				currentPassword, newPassword, profilePicture);
			return ResponseEntity.ok(new UserResponse(updated.getId(), updated.getUserName(),
				updated.getFirstName(), updated.getSecondName(), updated.getEmail(), updated.getBornDate(),
				updated.getUserType().name(), updated.getProfilePicturePath()));
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.badRequest().body(Map.of("message", "Invalid user type."));
		} catch (DuplicateUserException ex) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
		} catch (InvalidUserInputException ex) {
			return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
		} catch (StorageException ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(Map.of("message", ex.getMessage()));
		}
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> delete(@PathVariable Long id) {
		try {
			service.deleteUser(id);
			return ResponseEntity.ok(Map.of("message", "User deleted successfully."));
		} catch (InvalidUserInputException ex) {
			return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
		}
	}
}
