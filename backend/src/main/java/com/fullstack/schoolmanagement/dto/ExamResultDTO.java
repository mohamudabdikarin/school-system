package com.fullstack.schoolmanagement.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ExamResultDTO {
    private Long id;
    private BigDecimal marksObtained;
    private String grade;
    private String remarks;
    
    // Related entities as DTOs
    private Long examId;
    private String examType;
    private String examName;
    private String examDate;
    private Long studentId;
    private String studentName;
    private Long classId;
    private String className;
    private Long courseId;
    private String courseName;
} 