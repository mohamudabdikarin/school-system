package com.fullstack.schoolmanagement.service;

import com.fullstack.schoolmanagement.dto.ClassDTO;
import com.fullstack.schoolmanagement.dto.ClassResponseDTO;
import com.fullstack.schoolmanagement.dto.StudentDTO;
import com.fullstack.schoolmanagement.dto.TeacherSummaryDTO;
import com.fullstack.schoolmanagement.entity.SchoolClass;
import com.fullstack.schoolmanagement.entity.Student;
import com.fullstack.schoolmanagement.entity.Teacher;
import com.fullstack.schoolmanagement.repository.ClassRepository;
import com.fullstack.schoolmanagement.repository.StudentRepository;
import com.fullstack.schoolmanagement.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ClassService {

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Transactional(readOnly = true)
    public List<ClassDTO> getAllClasses() {
        return classRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Optional<ClassResponseDTO> getClassById(Long id) {
        return classRepository.findById(id).map(this::convertToResponseDto);
    }
    
    @Transactional(readOnly = true)
    public Optional<SchoolClass> getClassByName(String name) {
        return classRepository.findByName(name);
    }

    @Transactional
    public SchoolClass createClass(ClassDTO classDTO) {
        SchoolClass schoolClass = new SchoolClass();
        schoolClass.setName(classDTO.getName());

        if (classDTO.getTeacherIds() != null && !classDTO.getTeacherIds().isEmpty()) {
            Set<Teacher> resolvedTeachers = new HashSet<>(teacherRepository.findAllById(classDTO.getTeacherIds()));
            schoolClass.setTeachers(resolvedTeachers);
            // --- Synchronize both sides ---
            for (Teacher teacher : resolvedTeachers) {
                teacher.getAssignedClasses().add(schoolClass);
            }
        }

        return classRepository.save(schoolClass);
    }

    @Transactional
    public SchoolClass updateClass(Long id, ClassDTO classDTO) {
        SchoolClass schoolClass = classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found with id: " + id));

        schoolClass.setName(classDTO.getName());

        Set<Teacher> oldTeachers = new HashSet<>(schoolClass.getTeachers());
        Set<Teacher> newTeachers = classDTO.getTeacherIds() != null
            ? new HashSet<>(teacherRepository.findAllById(classDTO.getTeacherIds()))
            : new HashSet<>();

        // Remove this class from teachers who are no longer assigned
        for (Teacher oldTeacher : oldTeachers) {
            if (!newTeachers.contains(oldTeacher)) {
                oldTeacher.getAssignedClasses().remove(schoolClass);
            }
        }
        // Add this class to newly assigned teachers
        for (Teacher newTeacher : newTeachers) {
            newTeacher.getAssignedClasses().add(schoolClass);
        }
        schoolClass.setTeachers(newTeachers);

        return classRepository.save(schoolClass);
    }

    @Transactional
    public void deleteClass(Long id) {
        SchoolClass schoolClass = classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found with id: " + id));

        // IMPORTANT: Unassign students from this class before deleting it
        // to avoid foreign key constraint violations.
        List<Student> studentsInClass = studentRepository.findAllBySchoolClass(schoolClass);
        for (Student student : studentsInClass) {
            student.setSchoolClass(null);
        }
        studentRepository.saveAll(studentsInClass);
        
        // Unassign teachers (clears the join table entries)
        schoolClass.getTeachers().clear();
        
        classRepository.delete(schoolClass);
    }

    // New method to return all classes as ClassResponseDTO (with teacher names)
    @Transactional(readOnly = true)
    public List<ClassResponseDTO> getAllClassResponses() {
        return classRepository.findAll().stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    // Helper method to convert an Entity to a DTO
    private ClassDTO convertToDto(SchoolClass schoolClass) {
        ClassDTO dto = new ClassDTO();
        dto.setId(schoolClass.getId());
        dto.setName(schoolClass.getName());

        // This is safe because of @Transactional. It will fetch teachers if needed.
        if (schoolClass.getTeachers() != null) {
            Set<Long> teacherIds = schoolClass.getTeachers().stream()
                    .map(Teacher::getId)
                    .collect(Collectors.toSet());
            dto.setTeacherIds(teacherIds);
        }
        return dto;
    }

    // Helper to convert SchoolClass to ClassResponseDTO
    private ClassResponseDTO convertToResponseDto(SchoolClass schoolClass) {
        if (schoolClass == null) return null;
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

    // Method to get students by class ID
    @Transactional(readOnly = true)
    public List<StudentDTO> getStudentsByClassId(Long classId) {
        // First verify the class exists
        if (!classRepository.existsById(classId)) {
            throw new RuntimeException("Class not found with id: " + classId);
        }
        
        List<Student> students = studentRepository.findBySchoolClassId(classId);
        return students.stream()
                .map(this::convertStudentToDto)
                .collect(Collectors.toList());
    }

    // Helper method to convert Student entity to StudentDTO
    private StudentDTO convertStudentToDto(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setPhone(student.getPhone());
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setGender(student.getGender());
        dto.setAdmissionDate(student.getAdmissionDate());
        dto.setAddress(student.getAddress());
        dto.setUserId(student.getUser().getUserId());
        dto.setEmail(student.getUser().getEmail());
        
        // Set class information
        if (student.getSchoolClass() != null) {
            dto.setClassId(student.getSchoolClass().getId());
            dto.setClassName(student.getSchoolClass().getName());
        }
        
        // Set session information
        if (student.getSession() != null) {
            dto.setSessionId(student.getSession().getId());
        }
        
        return dto;
    }
}