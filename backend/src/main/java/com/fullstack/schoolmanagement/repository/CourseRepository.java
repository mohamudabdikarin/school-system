package com.fullstack.schoolmanagement.repository;

import com.fullstack.schoolmanagement.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseCode(String courseCode);
    List<Course> findByCourseNameContainingIgnoreCase(String courseName);
}