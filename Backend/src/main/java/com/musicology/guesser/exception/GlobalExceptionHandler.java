package com.musicology.guesser.exception;

import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.musicology.guesser.dto.ErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(ApiException ex) {
        return respond(ex.getCode(), ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleInvalidBody(MethodArgumentNotValidException ex) {
        String details = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return respond(ApiErrorCode.VALIDATION_ERROR, details.isEmpty() ? "Invalid request body" : details);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMalformedBody(HttpMessageNotReadableException ex) {
        return respond(ApiErrorCode.VALIDATION_ERROR, "Malformed JSON request body");
    }

    /** A mistyped URL is a 404, not a server error. */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleUnknownPath(NoResourceFoundException ex) {
        return respond(ApiErrorCode.NOT_FOUND, "No endpoint or resource at " + ex.getResourcePath());
    }

    /** Last resort: log the cause server-side, return an opaque message to the client. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("Unhandled exception", ex);
        return respond(ApiErrorCode.INTERNAL_ERROR, "Unexpected server error");
    }

    private ResponseEntity<ErrorResponse> respond(ApiErrorCode code, String message) {
        return ResponseEntity.status(code.status()).body(new ErrorResponse(code.name(), message));
    }
}
