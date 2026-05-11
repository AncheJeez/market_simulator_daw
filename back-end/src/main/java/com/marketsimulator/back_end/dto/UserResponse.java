package com.marketsimulator.back_end.dto;

import java.time.LocalDate;

public record UserResponse(Long id, String userName, String firstName, String secondName, String email, LocalDate bornDate, String userType,
	String profilePicturePath) {
}
