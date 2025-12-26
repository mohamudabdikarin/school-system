package com.fullstack.schoolmanagement.controller;

import com.fullstack.schoolmanagement.dto.ClassDTO;
import com.fullstack.schoolmanagement.dto.ClassResponseDTO;
import com.fullstack.schoolmanagement.dto.StudentDTO;
import com.fullstack.schoolmanagement.dto.TeacherSummaryDTO;
import com.fullstack.schoolmanagement.entity.SchoolClass;
import com.fullstack.schoolmanagement.entity.Student;
import com.fullstack.schoolmanagement.entity.Teacher;
import com.fullstack.schoolmanagement.service.ClassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
@RequestMapping("/api/v1/classes")
public class ClassController {

    @Autowired
    private ClassService classService;

    // Helper method to convert a fully loaded SchoolClass entity to a detailed DTO for the response.
    //don't return a sensetive data
    private ClassResponseDTO convertEntityToResponseDTO(SchoolClass schoolClass) {
        if (schoolClass == null) {
            return null;
        }

        Set<TeacherSummaryDTO> teacherDTOs = schoolClass.getTeachers().stream()
                .map(teacher -> new TeacherSummaryDTO(
                        teacher.getId(),
                        teacher.getFirstName(),
                        teacher.getLastName(),
                        teacher.getEmail()
                ))
                .collect(Collectors.toSet());

        return new ClassResponseDTO(schoolClass.getId(), schoolClass.getName(), teacherDTOs);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<?> getAllClasses() {
        try {
            // Use the new service method to get teacher names
            List<ClassResponseDTO> classes = classService.getAllClassResponses();
            return ResponseEntity.ok(classes);
        } catch (Exception e) {
            System.err.println("Error fetching classes: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred while fetching classes."));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<?> getClassById(@PathVariable Long id) {
        try {
            // The service returns an Optional of the DTO
            return classService.getClassById(id)
                    .map(ResponseEntity::ok) // If present, wrap in ResponseEntity.ok()
                    .orElse(ResponseEntity.notFound().build()); // If not found, return 404
        } catch (Exception e) {
            System.err.println("Error fetching class by id: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred."));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createClass(@RequestBody ClassDTO classDTO) {
        try {
            if (classDTO.getName() == null || classDTO.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Class name is required."));
            }

            // The controller's job is simple: pass the DTO to the service.
            SchoolClass createdClass = classService.createClass(classDTO);

            // Convert the saved entity to a rich response DTO for the client.
            ClassResponseDTO responseDTO = convertEntityToResponseDTO(createdClass);

            return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "A class with this name already exists."));
        } catch (Exception e) {
            System.err.println("Error creating class: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create class."));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateClass(@PathVariable Long id, @RequestBody ClassDTO classDTO) {
        try {
            if (classDTO.getName() == null || classDTO.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Class name is required."));
            }

            // Pass the DTO directly to the service for update logic.
            SchoolClass updatedClass = classService.updateClass(id, classDTO);

            // Convert the result to the response format.
            ClassResponseDTO responseDTO = convertEntityToResponseDTO(updatedClass);

            return ResponseEntity.ok(responseDTO);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "A class with this name already exists."));
        } catch (RuntimeException e) {
            // Catch the "not found" exception from the service.
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
            }
            throw e; // Re-throw other runtime exceptions
        } catch (Exception e) {
            System.err.println("Error updating class: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update class."));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteClass(@PathVariable Long id) {
        try {
            classService.deleteClass(id);
            return ResponseEntity.ok(Map.of("message", "Class deleted successfully."));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
            }
            throw e;
        }
    }

    @GetMapping("/{id}/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> getStudentsByClass(@PathVariable Long id) {
        try {
            // Check if the current user is a teacher
            boolean isTeacher = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER"));
            List<StudentDTO> students = classService.getStudentsByClassId(id);
            if (isTeacher) {
                // Only return id, firstName, lastName for teachers
                List<StudentDTO> limited = students.stream().map(s -> {
                    StudentDTO dto = new StudentDTO();
                    dto.setId(s.getId());
                    dto.setFirstName(s.getFirstName());
                    dto.setLastName(s.getLastName());
                    return dto;
                }).toList();
                return ResponseEntity.ok(limited);
            }
            return ResponseEntity.ok(students);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", e.getMessage()));
            }
            throw e;
        } catch (Exception e) {
            System.err.println("Error fetching students by class: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred while fetching students."));
        }
    }
}