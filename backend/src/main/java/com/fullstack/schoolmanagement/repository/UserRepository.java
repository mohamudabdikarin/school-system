package com.fullstack.schoolmanagement.repository;

import com.fullstack.schoolmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    long countByRole(String role);
    List<User> findByRole(String role);
}