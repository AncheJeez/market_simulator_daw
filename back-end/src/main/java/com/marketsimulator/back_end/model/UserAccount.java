package com.marketsimulator.back_end.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_user")
public class UserAccount {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "first_name", nullable = false, length = 80)
	private String firstName;

	@Column(name = "second_name", nullable = false, length = 80)
	private String secondName;

	@Column(name = "user_name", nullable = false, unique = true, length = 80)
	private String userName;

	@Enumerated(EnumType.STRING)
	@Column(name = "user_type", nullable = false, length = 20)
	private UserType userType;

	@Column(name = "password_hash", nullable = false, length = 100)
	private String passwordHash;

	@Column(name = "profile_picture_path", length = 255)
	private String profilePicturePath;

	protected UserAccount() {
	}

	public UserAccount(String firstName, String secondName, String userName, UserType userType,
		String passwordHash, String profilePicturePath) {
		this.firstName = firstName;
		this.secondName = secondName;
		this.userName = userName;
		this.userType = userType;
		this.passwordHash = passwordHash;
		this.profilePicturePath = profilePicturePath;
	}

	public Long getId() {
		return id;
	}

	public String getFirstName() {
		return firstName;
	}

	public String getSecondName() {
		return secondName;
	}

	public String getUserName() {
		return userName;
	}

	public UserType getUserType() {
		return userType;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public String getProfilePicturePath() {
		return profilePicturePath;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public void setSecondName(String secondName) {
		this.secondName = secondName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public void setUserType(UserType userType) {
		this.userType = userType;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

	public void setProfilePicturePath(String profilePicturePath) {
		this.profilePicturePath = profilePicturePath;
	}
}
