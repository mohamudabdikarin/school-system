package com.fullstack.schoolmanagement.controller;

import com.fullstack.schoolmanagement.dto.AttendanceDTO;
import com.fullstack.schoolmanagement.dto.AttendanceMarkRequest;
import com.fullstack.schoolmanagement.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<AttendanceDTO>> markAttendance(
            @RequestBody AttendanceMarkRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(attendanceService.markAttendance(request, userId));
    }

    @GetMapping("/class/{classId}/course/{courseId}/period/{periodId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByClassAndDate(
            @PathVariable Long classId,
            @PathVariable Long courseId,
            @PathVariable Long periodId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByClassAndDate(classId, courseId, periodId, date));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<List<AttendanceDTO>> getStudentAttendance(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(studentId, startDate, endDate));
    }
}
