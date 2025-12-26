package com.fullstack.schoolmanagement.dto;
import lombok.Data;
import java.util.Set;

@Data
public class ClassDTO {
    private Long id;
    private String name;
    private Set<Long> teacherIds;
}