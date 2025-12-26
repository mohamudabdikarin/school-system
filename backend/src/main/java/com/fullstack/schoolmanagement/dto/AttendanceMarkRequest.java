package com.fullstack.schoolmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceMarkRequest {
    private Long classId;
    private Long courseId;
    private Long periodId;
    private LocalDate attendanceDate;
    private List<StudentAttendance> students;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentAttendance {
        private Long studentId;
        private Boolean present;
        private String remarks;
    }
}
