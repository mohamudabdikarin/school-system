package com.fullstack.schoolmanagement.service;

import com.fullstack.schoolmanagement.entity.User;
import com.fullstack.schoolmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    public User updateUser(User user) {
        // This is a simple implementation. More complex logic can be added later.
        return userRepository.save(user);
    }

    public User updateUserStatus(String userId, boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setActive(isActive);
        return userRepository.save(user);
    }

    public void updateUserPassword(String userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        // Print the raw password before encryption
        System.out.println("Updating password for user " + userId + ". Raw password: " + newPassword);
        // Encrypt the password
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        userRepository.save(user);
    }
}
