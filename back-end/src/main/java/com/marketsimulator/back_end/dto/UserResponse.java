package com.marketsimulator.back_end.dto;

public record UserResponse(Long id, String userName, String firstName, String secondName, String userType,
	String profilePicturePath) {
}
