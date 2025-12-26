package com.fullstack.schoolmanagement.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseDTO {
    private Long id;
    private String courseCode;
    private String courseName;
    private String description;
    private TeacherDTO teacher;
} 