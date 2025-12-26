package com.fullstack.schoolmanagement.controller;

import com.fullstack.schoolmanagement.entity.Course;
import com.fullstack.schoolmanagement.service.CourseService;
import com.fullstack.schoolmanagement.dto.CourseDTO;
import com.fullstack.schoolmanagement.dto.TeacherDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/courses")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<CourseDTO> getAllCourses() {
        return courseService.getAllCourses().stream().map(course -> {
            CourseDTO dto = new CourseDTO();
            dto.setId(course.getId());
            dto.setCourseCode(course.getCourseCode());
            dto.setCourseName(course.getCourseName());
            dto.setDescription(course.getDescription());
            if (course.getTeacher() != null) {
                TeacherDTO teacherDTO = new TeacherDTO();
                teacherDTO.setId(course.getTeacher().getId());
                teacherDTO.setFirstName(course.getTeacher().getFirstName());
                teacherDTO.setLastName(course.getTeacher().getLastName());
                teacherDTO.setPhone(course.getTeacher().getPhone());
                teacherDTO.setSpecialization(course.getTeacher().getSpecialization());
                teacherDTO.setAddress(course.getTeacher().getAddress());
                teacherDTO.setQualification(course.getTeacher().getQualification());
                teacherDTO.setExperience(course.getTeacher().getExperience());
                teacherDTO.setGender(course.getTeacher().getGender());
                teacherDTO.setEmail(course.getTeacher().getEmail());
                teacherDTO.setHireDate(course.getTeacher().getHireDate() != null ? course.getTeacher().getHireDate().toString() : null);
                dto.setTeacher(teacherDTO);
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<?> getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCourse(@RequestBody Course course) {
        Course createdCourse = courseService.createCourse(course);
        CourseDTO courseDTO = convertToDTO(createdCourse);
        return new ResponseEntity<>(courseDTO, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody Course courseDetails) {
        try {
            Course updatedCourse = courseService.updateCourse(id, courseDetails);
            // Convert to DTO to avoid lazy loading issues
            CourseDTO courseDTO = convertToDTO(updatedCourse);
            return ResponseEntity.ok(courseDTO);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", e.getMessage()));
            }
            throw e;
        } catch (Exception e) {
            System.err.println("Error updating course: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update course."));
        }
    }

    // Helper method to convert Course entity to CourseDTO
    private CourseDTO convertToDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setCourseCode(course.getCourseCode());
        dto.setCourseName(course.getCourseName());
        dto.setDescription(course.getDescription());
        
        if (course.getTeacher() != null) {
            TeacherDTO teacherDTO = new TeacherDTO();
            teacherDTO.setId(course.getTeacher().getId());
            teacherDTO.setFirstName(course.getTeacher().getFirstName());
            teacherDTO.setLastName(course.getTeacher().getLastName());
            teacherDTO.setPhone(course.getTeacher().getPhone());
            teacherDTO.setSpecialization(course.getTeacher().getSpecialization());
            teacherDTO.setAddress(course.getTeacher().getAddress());
            teacherDTO.setQualification(course.getTeacher().getQualification());
            teacherDTO.setExperience(course.getTeacher().getExperience());
            teacherDTO.setGender(course.getTeacher().getGender());
            teacherDTO.setEmail(course.getTeacher().getEmail());
            teacherDTO.setHireDate(course.getTeacher().getHireDate() != null ? course.getTeacher().getHireDate().toString() : null);
            dto.setTeacher(teacherDTO);
        }
        
        return dto;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }
}