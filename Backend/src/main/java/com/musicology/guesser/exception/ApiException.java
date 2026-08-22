package com.musicology.guesser.exception;

public class ApiException extends RuntimeException {

    private final ApiErrorCode code;

    public ApiException(ApiErrorCode code, String message) {
        super(message);
        this.code = code;
    }

    public ApiErrorCode getCode() {
        return code;
    }
}
