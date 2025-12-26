package com.fullstack.schoolmanagement.dto;

import java.util.Set;
import java.util.stream.Collectors;

public class ClassResponseDTO {
    private Long id;
    private String name;
    private Set<TeacherSummaryDTO> teachers;
    
    // Default constructor
    public ClassResponseDTO() {}
    
    // Constructor with parameters
    public ClassResponseDTO(Long id, String name, Set<TeacherSummaryDTO> teachers) {
        this.id = id;
        this.name = name;
        this.teachers = teachers;
    }
    
    // Getters and setters
    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }
    
    public String getName() { 
        return name; 
    }
    
    public void setName(String name) { 
        this.name = name; 
    }
    
    public Set<TeacherSummaryDTO> getTeachers() { 
        return teachers; 
    }
    
    public void setTeachers(Set<TeacherSummaryDTO> teachers) { 
        this.teachers = teachers; 
    }
} 