package com.fullstack.schoolmanagement.dto;

import java.util.Set;

public class ClassRequestDTO {
    private String name;
    private Set<TeacherIdDTO> teachers;
    
    // Default constructor
    public ClassRequestDTO() {}
    
    // Constructor with parameters
    public ClassRequestDTO(String name, Set<TeacherIdDTO> teachers) {
        this.name = name;
        this.teachers = teachers;
    }
    
    // Getters and setters
    public String getName() { 
        return name; 
    }
    
    public void setName(String name) { 
        this.name = name; 
    }
    
    public Set<TeacherIdDTO> getTeachers() { 
        return teachers; 
    }
    
    public void setTeachers(Set<TeacherIdDTO> teachers) { 
        this.teachers = teachers; 
    }
} 