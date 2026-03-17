package com.marketsimulator.back_end.exception;

public class InvalidUserInputException extends RuntimeException {
	public InvalidUserInputException(String message) {
		super(message);
	}
}
