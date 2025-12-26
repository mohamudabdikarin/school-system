package com.fullstack.schoolmanagement.controller;

import com.fullstack.schoolmanagement.dto.ExamResultViewDTO;
import com.fullstack.schoolmanagement.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
@PreAuthorize("hasRole('ADMIN')") // Secures all methods in this controller
public class AdminReportController {

    private final ReportService reportService;

    public AdminReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/by-class/{classId}")
    public ResponseEntity<List<ExamResultViewDTO>> getReportByClass(
            @PathVariable Long classId,
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) LocalDate date) {
        List<ExamResultViewDTO> results = reportService.getResultsByClass(classId, examType, date);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/by-student/{studentId}")
    public ResponseEntity<List<ExamResultViewDTO>> getReportByStudent(
            @PathVariable Long studentId,
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) LocalDate date) {
        List<ExamResultViewDTO> results = reportService.getResultsByStudent(studentId, examType, date);
        return ResponseEntity.ok(results);
    }
}