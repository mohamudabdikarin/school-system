package com.fullstack.schoolmanagement.security;

import com.fullstack.schoolmanagement.entity.User;
import com.fullstack.schoolmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with user ID: " + userId));

        return new org.springframework.security.core.userdetails.User(
                user.getUserId(), // Use userId as the principal
                user.getPassword(),
                user.isActive(),
                true,
                true,
                true,
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole()))
        );
    }
}