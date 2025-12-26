package com.fullstack.schoolmanagement.service;

import com.fullstack.schoolmanagement.dto.ExamResultInputDTO;
import com.fullstack.schoolmanagement.dto.ExamResultViewDTO;
import com.fullstack.schoolmanagement.entity.*;
import com.fullstack.schoolmanagement.repository.*;
import com.fullstack.schoolmanagement.repository.ClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.fullstack.schoolmanagement.dto.StudentSummaryDTO;
import com.fullstack.schoolmanagement.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ExamResultService {
    private static final Logger logger = LoggerFactory.getLogger(ExamResultService.class);
    @Autowired
    private ExamResultRepository examResultRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private ClassRepository schoolClassRepository;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TeacherRepository teacherRepository;
    @Autowired
    private CourseRepository courseRepository;


    public ExamResultService() {
        // Default constructor
    }

    // FIX: Return DTOs, not entities
    @Transactional(readOnly = true)
    public List<ExamResultViewDTO> getAllExamResults() {
        return examResultRepository.findAll().stream()
                .map(this::convertToViewDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ExamResultViewDTO> getExamResultById(Long id) {
        return examResultRepository.findById(id).map(this::convertToViewDTO);
    }

    @Transactional
    public ExamResultViewDTO createExamResult(ExamResultInputDTO dto, Principal principal) {
        logger.info("createExamResult called with DTO: {} and principal: {}", dto, principal != null ? principal.getName() : "null");
        try {
            Student student = studentRepository.findById(dto.getStudentId()).orElseThrow(() -> new IllegalArgumentException("Student not found."));
            SchoolClass schoolClass = schoolClassRepository.findById(dto.getClassId()).orElseThrow(() -> new IllegalArgumentException("Class not found."));
            Course course = courseRepository.findById(dto.getCourseId()).orElseThrow(() -> new IllegalArgumentException("Course not found."));

            if (dto.getMarksObtained() == null || dto.getMarksObtained().doubleValue() < 0 || dto.getMarksObtained().doubleValue() > 100) {
                throw new IllegalArgumentException("Marks must be between 0 and 100.");
            }

            // --- 2. Check for Duplicates ---
            boolean exists = examResultRepository.existsByStudentIdAndCourseIdAndExamTypeAndExamDate(
                dto.getStudentId(), dto.getCourseId(), dto.getExamType(), dto.getExamDate()
            );
            if (exists) {
                throw new RuntimeException("An exam result for this student, course, and exam already exists on this date.");
            }

            // --- 3. Role-Based Permission Check ---
            String username = principal.getName();
            User currentUser = userRepository.findById(username).orElseThrow(() -> new RuntimeException("Current user not found."));
            boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority).anyMatch("ROLE_ADMIN"::equals);

            if (!isAdmin) {
                Teacher teacher = teacherRepository.findByUser_UserId(currentUser.getUserId()).orElseThrow(() -> new RuntimeException("Teacher profile not found for user."));
                if (teacher.getAssignedClasses() == null || teacher.getAssignedClasses().stream().noneMatch(c -> c.getId().equals(dto.getClassId()))) {
                    throw new RuntimeException("Permission Denied: You are not assigned to this class.");
                }

            }

            // --- 4. Create and Save Entity ---
            ExamResult result = new ExamResult();
            result.setStudent(student);
            result.setSchoolClass(schoolClass);
            result.setCourse(course);
            result.setExamType(dto.getExamType());
            result.setExamDate(dto.getExamDate());
            result.setMarksObtained(dto.getMarksObtained());
            result.setGrade(calculateGrade(dto.getMarksObtained().doubleValue()));
            ExamResult savedResult = examResultRepository.save(result);
            return convertToViewDTO(savedResult);
        } catch (Exception e) {
            logger.error("Error in createExamResult: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public ExamResultViewDTO updateExamResult(Long id, ExamResultInputDTO resultDTO, Principal principal) {
        ExamResult existingResult = examResultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam result not found with id: " + id));

        // Validate permissions - teachers can only update results for their assigned classes
        String username = principal.getName();
        User currentUser = userRepository.findById(username).orElseThrow(() -> new RuntimeException("Current user not found."));
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).anyMatch("ROLE_ADMIN"::equals);

        if (!isAdmin) {
            Teacher teacher = teacherRepository.findByUser_UserId(currentUser.getUserId()).orElseThrow(() -> new RuntimeException("Teacher profile not found for user."));
            if (teacher.getAssignedClasses() == null || teacher.getAssignedClasses().stream().noneMatch(c -> c.getId().equals(resultDTO.getClassId()))) {
                throw new RuntimeException("Permission Denied: You are not assigned to this class.");
            }
        }

        // Validate the new data
        SchoolClass schoolClass = schoolClassRepository.findById(resultDTO.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        
        Student student = studentRepository.findById(resultDTO.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        Course course = courseRepository.findById(resultDTO.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        // Check if student belongs to the class
        if (!student.getSchoolClass().getId().equals(resultDTO.getClassId())) {
            throw new IllegalArgumentException("Student does not belong to the selected class");
        }

        // Check if course belongs to the class
//        if (!course.getClass().get().equals(resultDTO.getClassId())) {
//            throw new IllegalArgumentException("Course does not belong to the selected class");
//        }

        // Check for duplicates (excluding the current result being updated)
        boolean exists = examResultRepository.existsByStudentIdAndCourseIdAndExamTypeAndExamDateAndIdNot(
            resultDTO.getStudentId(), resultDTO.getCourseId(), resultDTO.getExamType(), resultDTO.getExamDate(), id
        );
        if (exists) {
            throw new RuntimeException("An exam result for this student, course, and exam already exists on this date.");
        }

        // Update the exam result
        existingResult.setSchoolClass(schoolClass);
        existingResult.setStudent(student);
        existingResult.setCourse(course);
        existingResult.setExamType(resultDTO.getExamType());
        existingResult.setExamDate(resultDTO.getExamDate());
        existingResult.setMarksObtained(resultDTO.getMarksObtained());
        existingResult.setGrade(calculateGrade(resultDTO.getMarksObtained().doubleValue()));

        ExamResult updatedResult = examResultRepository.save(existingResult);
        return convertToViewDTO(updatedResult);
    }

    @Transactional
    public void deleteExamResult(Long id) {
        ExamResult result = examResultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam result not found with id: " + id));
        examResultRepository.delete(result);
    }

    // FIX: Remove methods that reference non-existent fields or methods unless you add them to the repository
    // If you want to keep these, ensure the repository supports them
    public List<ExamResultViewDTO> getExamResultsByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId).orElseThrow(() -> new IllegalArgumentException("Student not found."));
        return examResultRepository.findByStudent(student).stream().map(this::convertToViewDTO).collect(Collectors.toList());
    }

    // --- For student: get their own exam results ---
    public List<ExamResultViewDTO> getExamResultsForStudent(Principal principal) {
        if (principal == null) return List.of();
        String username = principal.getName();
        User user = userRepository.findById(username).orElse(null);
        if (user == null) return List.of();
        Student student = studentRepository.findByUser_UserId(user.getUserId()).orElse(null);
        if (student == null) return List.of();
        return examResultRepository.findByStudent(student).stream().map(this::convertToViewDTO).collect(Collectors.toList());
    }

    // Add similar methods as needed for your use case

    private String calculateGrade(double marks) {
        if (marks >= 90) return "A+";
        if (marks >= 80) return "A";
        if (marks >= 70) return "B";
        if (marks >= 60) return "C";
        if (marks >= 50) return "D";
        return "F";
    }

    private ExamResultViewDTO convertToViewDTO(ExamResult result) {
        ExamResultViewDTO dto = new ExamResultViewDTO();
        dto.setId(result.getId());
        // Set studentName for backward compatibility
        dto.setStudentName(result.getStudent() != null ? result.getStudent().getFirstName() + " " + result.getStudent().getLastName() : null);
        // Set student summary object for robust frontend grouping
        if (result.getStudent() != null) {
            StudentSummaryDTO studentSummary = new StudentSummaryDTO();
            studentSummary.setId(result.getStudent().getId());
            studentSummary.setFirstName(result.getStudent().getFirstName());
            studentSummary.setLastName(result.getStudent().getLastName());
            dto.setStudent(studentSummary);
        }
        dto.setClassName(result.getSchoolClass() != null ? result.getSchoolClass().getName() : null);
        dto.setCourseName(result.getCourse() != null ? result.getCourse().getCourseName() : null);
        dto.setExamType(result.getExamType());
        dto.setExamDate(result.getExamDate());
        dto.setMarksObtained(result.getMarksObtained());
        dto.setGrade(result.getGrade());
        dto.setRemarks(result.getRemarks());
        return dto;
    }
}