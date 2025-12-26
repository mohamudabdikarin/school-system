package com.fullstack.schoolmanagement.controller;

import com.fullstack.schoolmanagement.dto.LoginRequest;
import com.fullstack.schoolmanagement.dto.LoginResponse;
import com.fullstack.schoolmanagement.dto.RegisterRequest;
import com.fullstack.schoolmanagement.dto.RegisterResponse;
import com.fullstack.schoolmanagement.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.HashMap;
import java.util.Map;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"})
public class AuthController {

    @Autowired
    private AuthService authService;


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse loginResponse = authService.login(loginRequest);
            return ResponseEntity.ok(loginResponse);
        } catch (BadCredentialsException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid Credentials");
            errorResponse.put("message", "Please check your School ID and password and try again.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (UsernameNotFoundException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "User not found");
            errorResponse.put("message", "No user found with the provided School ID.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication failed");
            errorResponse.put("message", "An unexpected error occurred during login. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest registerRequest) {
        try {
            RegisterResponse registerResponse = authService.register(registerRequest);
            return ResponseEntity.ok(registerResponse);
        } catch (DataIntegrityViolationException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Registration failed");
            errorResponse.put("message", "Email or phone number already exists. Please use a unique value.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Registration failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping("/test-auth")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> testAuth() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Authentication successful");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
