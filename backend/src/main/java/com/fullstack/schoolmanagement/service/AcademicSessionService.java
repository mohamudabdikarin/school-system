package com.fullstack.schoolmanagement.service;

import com.fullstack.schoolmanagement.entity.AcademicSession;
import com.fullstack.schoolmanagement.repository.AcademicSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AcademicSessionService {

    @Autowired
    private AcademicSessionRepository academicSessionRepository;

    public List<AcademicSession> getAllAcademicSessions() {
        return academicSessionRepository.findAll();
    }

    public Optional<AcademicSession> getAcademicSessionById(Long id) {
        return academicSessionRepository.findById(id);
    }

    public AcademicSession createAcademicSession(AcademicSession academicSession) {
        return academicSessionRepository.save(academicSession);
    }

    public AcademicSession updateAcademicSession(Long id, AcademicSession updatedAcademicSession) {
        return academicSessionRepository.findById(id)
                .map(session -> {
                    session.setName(updatedAcademicSession.getName());
                    session.setStartDate(updatedAcademicSession.getStartDate());
                    session.setEndDate(updatedAcademicSession.getEndDate());
                    session.setCurrentSession(updatedAcademicSession.isCurrentSession());
                    return academicSessionRepository.save(session);
                })
                .orElseThrow(() -> new RuntimeException("Academic Session not found with id " + id));
    }

    public void deleteAcademicSession(Long id) {
        academicSessionRepository.deleteById(id);
    }

    public Optional<AcademicSession> getCurrentAcademicSession() {
        // Assuming there's only one current session marked as true
        List<AcademicSession> currentSessions = academicSessionRepository.findByCurrentSessionTrue();
        return currentSessions.isEmpty() ? Optional.empty() : Optional.of(currentSessions.get(0));
    }
}
