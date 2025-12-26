package com.fullstack.schoolmanagement.repository;

import com.fullstack.schoolmanagement.entity.Student;
import com.fullstack.schoolmanagement.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByIsActive(boolean isActive); // Fixed method name to match field name
    List<Student> findAllBySchoolClass(SchoolClass schoolClass);
    List<Student> findBySchoolClassId(Long classId);
    long countBySchoolClass(SchoolClass schoolClass);
    Optional<Student> findByUser_UserId(String userId);
}