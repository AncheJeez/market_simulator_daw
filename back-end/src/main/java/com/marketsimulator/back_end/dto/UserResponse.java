package com.marketsimulator.back_end.dto;

import java.time.LocalDate;

public class UserResponse {
    private final Long id;
    private final String userName;
    private final String firstName;
    private final String secondName;
    private final String email;
    private final LocalDate bornDate;
    private final String userType;
    private final long currency;
    private final String profilePicturePath;

    // Full constructor (with currency)
    public UserResponse(Long id, String userName, String firstName, String secondName, String email, LocalDate bornDate, String userType, long currency, String profilePicturePath) {
        this.id = id;
        this.userName = userName;
        this.firstName = firstName;
        this.secondName = secondName;
        this.email = email;
        this.bornDate = bornDate;
        this.userType = userType;
        this.currency = currency;
        this.profilePicturePath = profilePicturePath;
    }

    // Backwards-compatible constructor (without currency)
    public UserResponse(Long id, String userName, String firstName, String secondName, String email, LocalDate bornDate, String userType, String profilePicturePath) {
        this(id, userName, firstName, secondName, email, bornDate, userType, 10000L, profilePicturePath);
    }

    public Long getId() { return id; }
    public String getUserName() { return userName; }
    public String getFirstName() { return firstName; }
    public String getSecondName() { return secondName; }
    public String getEmail() { return email; }
    public LocalDate getBornDate() { return bornDate; }
    public String getUserType() { return userType; }
    public long getCurrency() { return currency; }
    public String getProfilePicturePath() { return profilePicturePath; }
}
