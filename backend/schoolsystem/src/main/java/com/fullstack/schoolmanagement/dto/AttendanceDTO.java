package com.fullstack.schoolmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long classId;
    private String className;
    private Long courseId;
    private String courseName;
    private Long periodId;
    private String periodName;
    private LocalDate attendanceDate;
    private Boolean present;
    private String markedByName;
    private String remarks;
}
