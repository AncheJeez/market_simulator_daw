package com.marketsimulator.back_end.dto;

import com.marketsimulator.back_end.model.UserType;

public record AdminUserUpdateRequest(
    String firstName,
    String secondName,
    String userName,
    UserType userType,
    String currentPassword,
    String newPassword
) {
}
