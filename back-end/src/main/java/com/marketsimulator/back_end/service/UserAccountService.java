package com.marketsimulator.back_end.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.marketsimulator.back_end.exception.DuplicateUserException;
import com.marketsimulator.back_end.exception.InvalidUserInputException;
import com.marketsimulator.back_end.exception.StorageException;
import com.marketsimulator.back_end.model.UserAccount;
import com.marketsimulator.back_end.model.UserType;
import com.marketsimulator.back_end.repository.UserAccountRepository;
import com.marketsimulator.back_end.dto.UserResponse;

@Service
public class UserAccountService {
	private final UserAccountRepository repository;
	private final PasswordEncoder passwordEncoder;
	private final Path uploadRoot;

	public List<UserResponse> getAllUsers() {
		return repository.findAll().stream()
			.map(user -> new UserResponse(user.getId(), user.getUserName(), user.getFirstName(),
				user.getSecondName(), user.getEmail(), user.getBornDate(), user.getUserType().name(), user.getProfilePicturePath()))
			.collect(Collectors.toList());
	}

	public UserAccountService(UserAccountRepository repository, PasswordEncoder passwordEncoder,
		@Value("${app.uploads.profile-pictures}") String uploadRoot) {
		this.repository = repository;
		this.passwordEncoder = passwordEncoder;
		this.uploadRoot = Paths.get(uploadRoot);
	}

	@Transactional
	public UserAccount register(String firstName, String secondName, String userName, String email, LocalDate bornDate, UserType userType,
		String rawPassword, MultipartFile profilePicture) {
		if (repository.existsByUserName(userName)) {
			throw new DuplicateUserException("User name already exists.");
		}
		String passwordHash = passwordEncoder.encode(rawPassword);
		UserAccount user = new UserAccount(firstName, secondName, userName, email, bornDate, userType, passwordHash, null);
		UserAccount saved = repository.save(user);
		if (profilePicture != null && !profilePicture.isEmpty()) {
			String profilePath = storeProfilePicture(profilePicture, saved.getId(), saved.getUserName(), null);
			saved.setProfilePicturePath(profilePath);
			return repository.save(saved);
		}
		return saved;
	}

	public Optional<UserAccount> authenticate(String userName, String rawPassword) {
		return repository.findByUserName(userName)
			.filter(user -> passwordEncoder.matches(rawPassword, user.getPasswordHash()));
	}

	@Transactional
	public UserAccount adminUpdateUser(Long id, String firstName, String secondName, String userName, String email, LocalDate bornDate,
		UserType userType, String currentPassword, String newPassword, MultipartFile profilePicture) {
		UserAccount user = repository.findById(id)
			.orElseThrow(() -> new InvalidUserInputException("User not found."));

		if (userName != null && !userName.isBlank() && !userName.equals(user.getUserName())) {
			if (repository.existsByUserName(userName)) {
				throw new DuplicateUserException("User name already exists.");
			}
			user.setUserName(userName.trim());
		}

		if (firstName != null) user.setFirstName(firstName.trim());
		if (email != null) user.setEmail(email.trim());
		if (bornDate != null) user.setBornDate(bornDate);
		if (secondName != null) user.setSecondName(secondName.trim());
		if (userType != null) user.setUserType(userType);

		if (newPassword != null && !newPassword.isBlank()) {
			if (currentPassword == null || currentPassword.isBlank()) {
				throw new InvalidUserInputException("Current password is required to set a new password.");
			}
			if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
				throw new InvalidUserInputException("Invalid current password.");
			}
			user.setPasswordHash(passwordEncoder.encode(newPassword));
		}

		if (profilePicture != null && !profilePicture.isEmpty()) {
			String profilePath = storeProfilePicture(profilePicture, user.getId(), user.getUserName(),
				user.getProfilePicturePath());
			user.setProfilePicturePath(profilePath);
		}

		return repository.save(user);
	}

	@Transactional
	public void deleteUser(Long id) {
		UserAccount user = repository.findById(id)
			.orElseThrow(() -> new InvalidUserInputException("User not found."));
		deleteExisting(user.getProfilePicturePath());
		repository.delete(user);
	}

	@Transactional
	public UserAccount updateProfile(Long id, String firstName, String secondName, String email, LocalDate bornDate, MultipartFile profilePicture) {
		UserAccount user = repository.findById(id)
			.orElseThrow(() -> new InvalidUserInputException("User not found."));

		if (firstName != null && !firstName.isBlank()) {
			user.setFirstName(firstName.trim());
		}
		if (secondName != null && !secondName.isBlank()) {
			user.setSecondName(secondName.trim());
		}
		if (email != null && !email.isBlank()) {
			user.setEmail(email.trim());
		}
		if (bornDate != null) {
			user.setBornDate(bornDate);
		}
		if (profilePicture != null && !profilePicture.isEmpty()) {
			String profilePath = storeProfilePicture(profilePicture, user.getId(), user.getUserName(),
				user.getProfilePicturePath());
			user.setProfilePicturePath(profilePath);
		}
		return repository.save(user);
	}

	private String storeProfilePicture(MultipartFile file, Long userId, String userName, String existingPath) {
		if (file == null || file.isEmpty()) {
			throw new InvalidUserInputException("Profile picture is required.");
		}
		String contentType = file.getContentType();
		if (contentType == null || (!contentType.equalsIgnoreCase("image/png")
			&& !contentType.equalsIgnoreCase("image/jpeg"))) {
			throw new InvalidUserInputException("Profile picture must be PNG or JPEG.");
		}
		try {
			Files.createDirectories(uploadRoot);
			String extension = contentType.equalsIgnoreCase("image/png") ? ".png" : ".jpg";
			String safeUserName = userName.replaceAll("[^a-zA-Z0-9_-]", "_");
			String fileName = userId + "-" + safeUserName + extension;
			Path destination = uploadRoot.resolve(fileName);
			deleteExisting(existingPath);
			file.transferTo(destination);
			return "uploads/profile-pictures/" + fileName;
		} catch (IOException ex) {
			throw new StorageException("Unable to store profile picture.");
		}
	}

	private void deleteExisting(String existingPath) {
		if (existingPath == null || existingPath.isBlank()) {
			return;
		}
		Path existing = Paths.get(existingPath);
		if (!existing.isAbsolute()) {
			existing = Paths.get(existingPath).normalize();
		}
		try {
			Files.deleteIfExists(existing);
		} catch (IOException ex) {
			throw new StorageException("Unable to delete previous profile picture.");
		}
	}
}
