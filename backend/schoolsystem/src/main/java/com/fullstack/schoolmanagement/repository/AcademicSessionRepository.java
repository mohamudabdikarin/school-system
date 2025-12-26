package com.fullstack.schoolmanagement.repository;

import com.fullstack.schoolmanagement.entity.AcademicSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface AcademicSessionRepository extends JpaRepository<AcademicSession, Long> {
    Optional<AcademicSession> findByName(String name);
    List<AcademicSession> findByCurrentSessionTrue();
}