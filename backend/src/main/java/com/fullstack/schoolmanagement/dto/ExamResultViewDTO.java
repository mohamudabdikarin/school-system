package com.fullstack.schoolmanagement.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExamResultViewDTO {
    private Long id;
    private String studentName;
    private String className;
    private String courseName;
    private String examType;
    private LocalDate examDate;
    private BigDecimal marksObtained;
    private String grade;
    private String remarks;
    // Add student summary for frontend grouping
    private StudentSummaryDTO student;
}