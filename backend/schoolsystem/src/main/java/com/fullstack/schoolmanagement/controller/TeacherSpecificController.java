package com.fullstack.schoolmanagement.controller;

import com.fullstack.schoolmanagement.entity.Teacher;
import com.fullstack.schoolmanagement.entity.SchoolClass;
import com.fullstack.schoolmanagement.entity.Student;
import com.fullstack.schoolmanagement.entity.ExamResult;
import com.fullstack.schoolmanagement.repository.TeacherRepository;
import com.fullstack.schoolmanagement.repository.StudentRepository;
import com.fullstack.schoolmanagement.repository.ExamResultRepository;
import com.fullstack.schoolmanagement.dto.StudentDTO;
import com.fullstack.schoolmanagement.dto.ClassResponseDTO;
import com.fullstack.schoolmanagement.dto.ExamResultDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/teacher")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class TeacherSpecificController {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ExamResultRepository examResultRepository;

    @GetMapping("/classes/{teacherUserId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<ClassResponseDTO>> getTeacherClasses(@PathVariable String teacherUserId) {
        Teacher teacher = teacherRepository.findByUser_UserId(teacherUserId).orElse(null);
        
        if (teacher == null) {
            return ResponseEntity.notFound().build();
        }

        Set<SchoolClass> classes = teacher.getAssignedClasses();
        List<ClassResponseDTO> classDTOs = classes.stream()
            .map(this::convertToClassResponseDTO)
            .collect(Collectors.toList());

        return ResponseEntity.ok(classDTOs);
    }

    @GetMapping("/students/{teacherUserId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<StudentDTO>> getTeacherStudents(@PathVariable String teacherUserId) {
        Teacher teacher = teacherRepository.findByUser_UserId(teacherUserId).orElse(null);
        
        if (teacher == null) {
            return ResponseEntity.notFound().build();
        }

        Set<SchoolClass> classes = teacher.getAssignedClasses();
        List<Student> students = classes.stream()
            .flatMap(schoolClass -> studentRepository.findAllBySchoolClass(schoolClass).stream())
            .distinct()
            .toList();

        List<StudentDTO> studentDTOs = students.stream()
            .map(student -> {
                StudentDTO dto = new StudentDTO();
                dto.setId(student.getId());
                dto.setFirstName(student.getFirstName());
                dto.setLastName(student.getLastName());
                return dto;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(studentDTOs);
    }

    @GetMapping("/exam-results/{teacherUserId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<ExamResultDTO>> getTeacherExamResults(@PathVariable String teacherUserId) {
        Teacher teacher = teacherRepository.findByUser_UserId(teacherUserId).orElse(null);
        
        if (teacher == null) {
            return ResponseEntity.notFound().build();
        }

        Set<SchoolClass> classes = teacher.getAssignedClasses();
        List<Student> students = classes.stream()
            .flatMap(schoolClass -> studentRepository.findAllBySchoolClass(schoolClass).stream())
            .distinct()
            .toList();

        List<ExamResult> examResults = students.stream()
            .flatMap(student -> examResultRepository.findByStudent(student).stream())
            .toList();

        List<ExamResultDTO> examResultDTOs = examResults.stream()
            .map(this::convertToExamResultDTO)
            .collect(Collectors.toList());

        return ResponseEntity.ok(examResultDTOs);
    }

    private ClassResponseDTO convertToClassResponseDTO(SchoolClass schoolClass) {
        ClassResponseDTO dto = new ClassResponseDTO();
        dto.setId(schoolClass.getId());
        dto.setName(schoolClass.getName());
        return dto;
    }

    private StudentDTO convertToStudentDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setPhone(student.getPhone());
        dto.setGender(student.getGender());
        dto.setAddress(student.getAddress());
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setAdmissionDate(student.getAdmissionDate());
        dto.setActive(student.isActive());
        if (student.getSchoolClass() != null) {
            dto.setClassId(student.getSchoolClass().getId());
            dto.setClassName(student.getSchoolClass().getName());
        }
        return dto;
    }

    private ExamResultDTO convertToExamResultDTO(ExamResult examResult) {
        ExamResultDTO dto = new ExamResultDTO();
        dto.setId(examResult.getId());
        dto.setExamType(examResult.getExamType());
        dto.setExamDate(examResult.getExamDate().toString());
        dto.setMarksObtained(examResult.getMarksObtained());
        dto.setGrade(examResult.getGrade());
        dto.setRemarks(examResult.getRemarks());
        
        if (examResult.getStudent() != null) {
            dto.setStudentId(examResult.getStudent().getId());
            dto.setStudentName(examResult.getStudent().getFirstName() + " " + examResult.getStudent().getLastName());
        }
        
        if (examResult.getSchoolClass() != null) {
            dto.setClassId(examResult.getSchoolClass().getId());
            dto.setClassName(examResult.getSchoolClass().getName());
        }
        
        if (examResult.getCourse() != null) {
            dto.setCourseId(examResult.getCourse().getId());
            dto.setCourseName(examResult.getCourse().getCourseName());
        }
        
        return dto;
    }
} 