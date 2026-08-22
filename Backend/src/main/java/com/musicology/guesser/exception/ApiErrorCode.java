package com.musicology.guesser.exception;

import org.springframework.http.HttpStatus;

public enum ApiErrorCode {

    SESSION_NOT_FOUND(HttpStatus.NOT_FOUND),
    ROUND_NOT_FOUND(HttpStatus.NOT_FOUND),
    ROUND_ALREADY_GUESSED(HttpStatus.CONFLICT),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST),
    NOT_FOUND(HttpStatus.NOT_FOUND),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR);

    private final HttpStatus status;

    ApiErrorCode(HttpStatus status) {
        this.status = status;
    }

    public HttpStatus status() {
        return status;
    }
}
