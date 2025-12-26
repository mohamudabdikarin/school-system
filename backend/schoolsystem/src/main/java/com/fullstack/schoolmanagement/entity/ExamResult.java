package com.fullstack.schoolmanagement.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "exam_results")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExamResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Remove Exam relationship
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "exam_id")
    // private Exam exam;

    @Column(nullable = false)
    private String examType; // e.g., "Midterm", "Final", "Quiz"

    @Column(nullable = false)
    private java.time.LocalDate examDate;

    // --- NEW: Relationship to the student who took the exam ---
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    // --- NEW: Relationship to the class the exam was for ---
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    // --- NEW: Relationship to the subject ---
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;



    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal marksObtained;

    @Column(nullable = false)
    private String grade; // e.g., "A+", "B", "C"

    private String remarks; // e.g., "Good performance", "Needs improvement"
}