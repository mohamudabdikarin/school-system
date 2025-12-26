package com.fullstack.schoolmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PeriodDTO {
    private Long id;
    private Long classId;
    private String className;
    private Long courseId;
    private String courseName;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer periodNumber;
    private String dayOfWeek;
}
