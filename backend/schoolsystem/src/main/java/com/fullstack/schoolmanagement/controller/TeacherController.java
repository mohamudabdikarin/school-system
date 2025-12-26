package com.fullstack.schoolmanagement.controller;

import com.fullstack.schoolmanagement.dto.TeacherDTO;
import com.fullstack.schoolmanagement.entity.Teacher;
import com.fullstack.schoolmanagement.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/teachers")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    // Helper method to convert a Teacher entity to a DTO, preventing code duplication.
    private TeacherDTO convertToDto(Teacher teacher) {
        if (teacher == null) return null;

        TeacherDTO dto = new TeacherDTO();
        dto.setId(teacher.getId());
        dto.setUserId(teacher.getUser() != null ? teacher.getUser().getUserId() : null);
        dto.setHireDate(teacher.getHireDate() != null ? teacher.getHireDate().toString() : null);
        dto.setFirstName(teacher.getFirstName());
        dto.setLastName(teacher.getLastName());
        dto.setPhone(teacher.getPhone());
        dto.setSpecialization(teacher.getSpecialization());
        dto.setAddress(teacher.getAddress());
        dto.setQualification(teacher.getQualification());
        dto.setExperience(teacher.getExperience());
        dto.setGender(teacher.getGender());
        dto.setEmail(teacher.getUser() != null ? teacher.getUser().getEmail() : null);
        return dto;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<TeacherDTO>> getAllTeachers() {
        // This is already perfect as the service returns a list of DTOs.
        List<TeacherDTO> teachers = teacherService.getAllTeachers();
        return ResponseEntity.ok(teachers);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeacherDTO> getTeacherById(@PathVariable Long id) {
        // The service returns Optional<Teacher>, so we map it to our DTO here.
        return teacherService.getTeacherById(id)
                .map(this::convertToDto) // Use the helper method for conversion
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Note: The creation of teachers is typically handled by an AuthController's
    // register endpoint, which creates the User and associated Teacher profile.

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateTeacher(@PathVariable Long id, @RequestBody @Valid TeacherDTO teacherDTO) {
        try {
            // Service method now takes a DTO and returns the updated entity
            Teacher updatedTeacher = teacherService.updateTeacher(id, teacherDTO);
            // Convert the updated entity to a DTO for the response
            return ResponseEntity.ok(convertToDto(updatedTeacher));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
            }
            // For other unexpected errors
            System.err.println("Error updating teacher: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred."));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteTeacher(@PathVariable Long id) {
        try {
            teacherService.deleteTeacher(id);
            return ResponseEntity.ok(Map.of("message", "Teacher deleted successfully."));
        } catch (RuntimeException e) {
            // The service throws an exception if the teacher is not found.
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
            }
            System.err.println("Error deleting teacher: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred during deletion."));
        }
    }
}