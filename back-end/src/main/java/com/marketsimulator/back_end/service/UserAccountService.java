package com.marketsimulator.back_end.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

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

@Service
public class UserAccountService {
	private final UserAccountRepository repository;
	private final PasswordEncoder passwordEncoder;
	private final Path uploadRoot;

	public UserAccountService(UserAccountRepository repository, PasswordEncoder passwordEncoder,
		@Value("${app.uploads.profile-pictures}") String uploadRoot) {
		this.repository = repository;
		this.passwordEncoder = passwordEncoder;
		this.uploadRoot = Paths.get(uploadRoot);
	}

	@Transactional
	public UserAccount register(String firstName, String secondName, String userName, UserType userType,
		String rawPassword, MultipartFile profilePicture) {
		if (repository.existsByUserName(userName)) {
			throw new DuplicateUserException("User name already exists.");
		}
		String passwordHash = passwordEncoder.encode(rawPassword);
		UserAccount user = new UserAccount(firstName, secondName, userName, userType, passwordHash, null);
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
	public UserAccount updateProfile(Long id, String firstName, String secondName, MultipartFile profilePicture) {
		UserAccount user = repository.findById(id)
			.orElseThrow(() -> new InvalidUserInputException("User not found."));

		if (firstName != null && !firstName.isBlank()) {
			user.setFirstName(firstName.trim());
		}
		if (secondName != null && !secondName.isBlank()) {
			user.setSecondName(secondName.trim());
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
