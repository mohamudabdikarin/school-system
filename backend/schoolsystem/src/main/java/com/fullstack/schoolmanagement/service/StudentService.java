package com.fullstack.schoolmanagement.service;

import com.fullstack.schoolmanagement.dto.StudentDTO;
import com.fullstack.schoolmanagement.entity.SchoolClass;
import com.fullstack.schoolmanagement.entity.Student;
import com.fullstack.schoolmanagement.entity.User;
import com.fullstack.schoolmanagement.ResourceNotFoundException; // You might need to create this custom exception class
import com.fullstack.schoolmanagement.repository.ExamResultRepository;
import com.fullstack.schoolmanagement.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;
import org.springframework.validation.Validator;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentService {
    private static final Logger logger = LoggerFactory.getLogger(StudentService.class);

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ExamResultRepository examResultRepository;

    @Autowired
    private SchoolClassService schoolClassService;

    @Autowired
    private AcademicSessionService academicSessionService;

    @Autowired
    private UserService userService;

    @Autowired
    private Validator validator;

    /**
     * Converts a Student entity to a StudentDTO.
     * This helper method centralizes the conversion logic.
     */
    public StudentDTO convertToDto(Student student) {
        if (student == null) {
            return null;
        }
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setPhone(student.getPhone());
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setGender(student.getGender());
        dto.setAdmissionDate(student.getAdmissionDate());
        dto.setClassId(student.getSchoolClass() != null ? student.getSchoolClass().getId() : null);
        dto.setClassName(student.getSchoolClass() != null ? student.getSchoolClass().getName() : null);
        dto.setSessionId(student.getSession() != null ? student.getSession().getId() : null);
        dto.setAddress(student.getAddress());
        dto.setUserId(student.getUser() != null ? student.getUser().getUserId() : null);
        dto.setEmail(student.getUser() != null ? student.getUser().getEmail() : null);
        return dto;
    }

    /**
     * Fetches all students, optionally filtered by classId.
     *
     * @param classId Optional ID of the class to filter by.
     * @return A list of StudentDTOs.
     */
    @Transactional(readOnly = true)
    public List<StudentDTO> getAllStudents(Long classId) {
        List<Student> students;
        if (classId != null) {
            logger.info("Fetching students for classId: {}", classId);
            students = studentRepository.findBySchoolClassId(classId);
        } else {
            logger.info("Fetching all students");
            students = studentRepository.findAll();
        }
        return students.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Fetches a single student by ID and returns it as a DTO.
     */
    @Transactional(readOnly = true)
    public Optional<StudentDTO> findDTOById(Long id) {
        return studentRepository.findById(id).map(this::convertToDto);
    }

    /**
     * Fetches a single student entity by ID. Used for internal service operations.
     */
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    @Transactional
    public StudentDTO createStudent(StudentDTO studentDTO) {
        Student student = new Student();
        // Set properties from DTO
        student.setFirstName(studentDTO.getFirstName());
        student.setLastName(studentDTO.getLastName());
        student.setPhone(studentDTO.getPhone());
        student.setDateOfBirth(studentDTO.getDateOfBirth());
        student.setGender(studentDTO.getGender());
        student.setAdmissionDate(studentDTO.getAdmissionDate());
        student.setAddress(studentDTO.getAddress());

        // Associate with other entities
        if (studentDTO.getClassId() != null) {
            // Assuming schoolClassService.getSchoolClassById throws an exception if not found
            SchoolClass schoolClass = schoolClassService.getSchoolClassById(studentDTO.getClassId());
            student.setSchoolClass(schoolClass);
        }
        if (studentDTO.getSessionId() != null) {
            student.setSession(academicSessionService.getAcademicSessionById(studentDTO.getSessionId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid sessionId provided")));
        }
        if (studentDTO.getUserId() != null) {
            student.setUser(userService.getUserById(studentDTO.getUserId()));
        }

        // Manual validation before save
        BindingResult bindingResult = new BeanPropertyBindingResult(student, "student");
        validator.validate(student, bindingResult);
        if (bindingResult.hasErrors()) {
            String message = bindingResult.getAllErrors().get(0).getDefaultMessage();
            throw new RuntimeException(message);
        }

        Student savedStudent = studentRepository.save(student);
        logger.info("Created new student with id: {}", savedStudent.getId());
        return convertToDto(savedStudent);
    }

    @Transactional
    public StudentDTO updateStudent(Long id, StudentDTO studentDTO) {
        Student student = getStudentById(id); // This will throw an exception if not found

        student.setFirstName(studentDTO.getFirstName());
        student.setLastName(studentDTO.getLastName());
        student.setPhone(studentDTO.getPhone());
        student.setDateOfBirth(studentDTO.getDateOfBirth());
        student.setGender(studentDTO.getGender());
        student.setAdmissionDate(studentDTO.getAdmissionDate());
        student.setAddress(studentDTO.getAddress());

        // Update class association
        if (studentDTO.getClassId() != null) {
            SchoolClass schoolClass = schoolClassService.getSchoolClassById(studentDTO.getClassId());
            student.setSchoolClass(schoolClass);
        } else {
            student.setSchoolClass(null); // Allow un-assigning from a class
        }

        // Manual validation before save
        BindingResult bindingResult = new BeanPropertyBindingResult(student, "student");
        validator.validate(student, bindingResult);
        if (bindingResult.hasErrors()) {
            String message = bindingResult.getAllErrors().get(0).getDefaultMessage();
            throw new RuntimeException(message);
        }

        Student updatedStudent = studentRepository.save(student);
        logger.info("Updated student with id: {}", updatedStudent.getId());
        return convertToDto(updatedStudent);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = getStudentById(id); // This will throw an exception if not found

        // Delete related ExamResults first to avoid constraint violations
        logger.info("Deleting exam results for student id: {}", id);
        examResultRepository.deleteByStudent(student); // Assuming a deleteByStudent method exists for efficiency

        // Now delete the student
        studentRepository.delete(student);
        logger.info("Deleted student with id: {}", id);
    }
}