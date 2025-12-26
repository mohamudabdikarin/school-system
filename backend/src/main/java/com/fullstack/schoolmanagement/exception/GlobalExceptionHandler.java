package com.fullstack.schoolmanagement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.MethodArgumentNotValidException;

import jakarta.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("Validation error");
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> handleConstraintViolationException(ConstraintViolationException ex) {
        String message = ex.getConstraintViolations().stream()
                .map(v -> v.getMessage())
                .findFirst()
                .orElse("Validation error");
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        String message = ex.getMessage();
        if (message != null && message.toLowerCase().contains("email")) {
            message = "Email already exists. Please use a unique email address.";
        } else if (message != null && message.toLowerCase().contains("phone")) {
            message = "Phone number already exists. Please use a unique phone number.";
        } else {
            message = "A data integrity error occurred.";
        }
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
        String message = ex.getMessage();
        if (message != null && message.contains("This is not a valid number")) {
            message = "This is not a valid number. Please enter a valid number.";
        } else {
            message = "An unexpected error occurred.";
        }
        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
} 