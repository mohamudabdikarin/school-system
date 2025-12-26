package com.fullstack.schoolmanagement.controller;

import com.fullstack.schoolmanagement.entity.AcademicSession;
import com.fullstack.schoolmanagement.service.AcademicSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/academic-sessions")
public class AcademicSessionController {

    @Autowired
    private AcademicSessionService academicSessionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<List<AcademicSession>> getAllAcademicSessions() {
        List<AcademicSession> sessions = academicSessionService.getAllAcademicSessions();
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<AcademicSession> getAcademicSessionById(@PathVariable Long id) {
        Optional<AcademicSession> session = academicSessionService.getAcademicSessionById(id);
        return session.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AcademicSession> createAcademicSession(@RequestBody AcademicSession academicSession) {
        AcademicSession createdSession = academicSessionService.createAcademicSession(academicSession);
        return new ResponseEntity<>(createdSession, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AcademicSession> updateAcademicSession(@PathVariable Long id, @RequestBody AcademicSession academicSession) {
        try {
            AcademicSession updatedSession = academicSessionService.updateAcademicSession(id, academicSession);
            return ResponseEntity.ok(updatedSession);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAcademicSession(@PathVariable Long id) {
        academicSessionService.deleteAcademicSession(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<AcademicSession> getCurrentAcademicSession() {
        return academicSessionService.getCurrentAcademicSession()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
