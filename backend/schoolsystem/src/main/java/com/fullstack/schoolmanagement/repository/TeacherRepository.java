package com.fullstack.schoolmanagement.repository;

import com.fullstack.schoolmanagement.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    List<Teacher> findBySpecialization(String specialization);
    List<Teacher> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);
    Optional<Teacher> findByUser_UserId(String userId);
}