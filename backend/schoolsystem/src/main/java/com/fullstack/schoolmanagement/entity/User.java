package com.fullstack.schoolmanagement.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @Column(name = "user_id", unique = true, nullable = false, updatable = false)
    private String userId;


    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // e.g., "ROLE_ADMIN", "ROLE_TEACHER", "ROLE_STUDENT"

    private boolean isActive = true;

    @Column(nullable = false, unique = true)
    private String email;
}