package com.fullstack.schoolmanagement.controller;

import com.fullstack.schoolmanagement.entity.User;
import com.fullstack.schoolmanagement.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> getAllUsers() {
        return userService.getAllUsers().stream().map(user -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("userId", user.getUserId());
            map.put("role", user.getRole());
            map.put("isActive", user.isActive());
            map.put("password", user.getPassword());
            return map;
        }).collect(Collectors.toList());
    }

    @PatchMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserStatus(@PathVariable String userId, @RequestBody Map<String, Boolean> status) {
        Boolean isActive = status.get("isActive");
        if (isActive == null) {
            return ResponseEntity.badRequest().build();
        }
        User updatedUser = userService.updateUserStatus(userId, isActive);
        return ResponseEntity.ok(updatedUser);
    
    }

    @PatchMapping("/{userId}/password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserPassword(@PathVariable String userId, @RequestBody Map<String, String> body) {
        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password is required."));
        }
        try {
            userService.updateUserPassword(userId, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to update password."));
        }
    }
}

