package com.fullstack.schoolmanagement.controller;

import com.fullstack.schoolmanagement.dto.StudentDTO;
import com.fullstack.schoolmanagement.entity.Student;
import com.fullstack.schoolmanagement.service.StudentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/students")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"})
public class StudentController {
    private static final Logger logger = LoggerFactory.getLogger(StudentController.class);

    @Autowired
    private StudentService studentService;

    // --- THIS IS THE UPDATED METHOD ---
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<StudentDTO> getAllStudents(
            // @RequestParam makes `classId` an optional URL parameter (e.g., ?classId=1)
            @RequestParam(required = false) Long classId
    ) {
        // The service layer now handles the logic of filtering by classId if it's present.
        return studentService.getAllStudents(classId);
    }

    // ... (the rest of your controller remains the same, but let's clean it up slightly for consistency)

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        // Let's assume you've added the convertToDto helper in your service
        return studentService.findDTOById(id) // Example: service could return Optional<StudentDTO>
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createStudent(@RequestBody @Valid StudentDTO studentDTO) {
        try {
            StudentDTO createdStudentDTO = studentService.createStudent(studentDTO);
            return new ResponseEntity<>(createdStudentDTO, HttpStatus.CREATED);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email or phone number already exists."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody @Valid StudentDTO studentDTO) {
        try {
            StudentDTO updatedStudentDTO = studentService.updateStudent(id, studentDTO);
            return ResponseEntity.ok(updatedStudentDTO);
        } catch (RuntimeException e) {
            // Catch specific exceptions from the service
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        try {
            studentService.deleteStudent(id);
            return ResponseEntity.ok(Map.of("message", "Student deleted successfully."));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An unexpected error occurred."));
        }
    }
}