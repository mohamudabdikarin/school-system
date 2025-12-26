package com.fullstack.schoolmanagement.dto;

public class TeacherIdDTO {
    private Long id;
    
    // Default constructor
    public TeacherIdDTO() {}
    
    // Constructor with parameter
    public TeacherIdDTO(Long id) {
        this.id = id;
    }
    
    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }
} 