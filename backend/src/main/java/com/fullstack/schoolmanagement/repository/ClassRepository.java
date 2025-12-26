package com.fullstack.schoolmanagement.repository;

import com.fullstack.schoolmanagement.entity.SchoolClass; // Updated import
import com.fullstack.schoolmanagement.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<SchoolClass, Long> {
    Optional<SchoolClass> findByName(String name);
    List<SchoolClass> findByTeachers_Id(Long teacherId);
    
}