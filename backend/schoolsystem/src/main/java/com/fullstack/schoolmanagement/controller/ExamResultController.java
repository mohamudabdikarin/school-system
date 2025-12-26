// src/main/java/com/fullstack/schoolmanagement/controller/ExamResultController.java
package com.fullstack.schoolmanagement.controller;

import com.fullstack.schoolmanagement.dto.ExamResultInputDTO;
import com.fullstack.schoolmanagement.dto.ExamResultViewDTO;
import com.fullstack.schoolmanagement.service.ExamResultService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/exam-results")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class ExamResultController {

    private final ExamResultService examResultService;

    public ExamResultController(ExamResultService examResultService) {
        this.examResultService = examResultService;
    }

    // GET all results (can be filtered by role in service)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<ExamResultViewDTO>> getAllExamResults() {
        // The service layer can be enhanced to filter results based on role
        return ResponseEntity.ok(examResultService.getAllExamResults());
    }

    // GET exam results for the logged-in student
    @GetMapping("/mine")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ExamResultViewDTO>> getMyExamResults(Principal principal) {
        List<ExamResultViewDTO> results = examResultService.getExamResultsForStudent(principal);
        return ResponseEntity.ok(results);
    }

    // POST a new exam result
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> createExamResult(@RequestBody ExamResultInputDTO resultDTO, Principal principal) {
        try {
            ExamResultViewDTO createdResult = examResultService.createExamResult(resultDTO, principal);
            return new ResponseEntity<>(createdResult, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            // Catching specific exceptions for duplicates or permission denied
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

    // DELETE an exam result (Admin and Teacher)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Map<String, String>> deleteExamResult(@PathVariable Long id) {
        examResultService.deleteExamResult(id);
        return ResponseEntity.ok(Map.of("message", "Exam result deleted successfully."));
    }

    // PUT update an exam result
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<?> updateExamResult(@PathVariable Long id, @RequestBody ExamResultInputDTO resultDTO, Principal principal) {
        try {
            ExamResultViewDTO updatedResult = examResultService.updateExamResult(id, resultDTO, principal);
            return ResponseEntity.ok(updatedResult);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }
}