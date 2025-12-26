package com.fullstack.schoolmanagement.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExamResultInputDTO {
    private Long classId;
    private Long studentId;
    private Long courseId; // Use courseId instead of subjectId
    private String examType;
    private LocalDate examDate;
    private BigDecimal marksObtained;
}