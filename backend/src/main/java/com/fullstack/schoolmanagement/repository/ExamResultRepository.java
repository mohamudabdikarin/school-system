package com.fullstack.schoolmanagement.repository;

import com.fullstack.schoolmanagement.entity.ExamResult;
import com.fullstack.schoolmanagement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    boolean existsByStudentIdAndCourseIdAndExamTypeAndExamDate(Long studentId, Long courseId, String examType, java.time.LocalDate examDate); // For duplicate check
    boolean existsByStudentIdAndCourseIdAndExamTypeAndExamDateAndIdNot(Long studentId, Long courseId, String examType, java.time.LocalDate examDate, Long id); // For update duplicate check
    List<ExamResult> findByStudent(Student student); // FIX: Add method to find all results for a student
    void deleteByStudent(Student student); // FIX: Add method to delete all results for a student
    long countByStudent(Student student);
}