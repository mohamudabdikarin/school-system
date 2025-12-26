package com.fullstack.schoolmanagement.service;

import com.fullstack.schoolmanagement.dto.TeacherDTO;
import com.fullstack.schoolmanagement.entity.SchoolClass;
import com.fullstack.schoolmanagement.entity.Teacher;
import com.fullstack.schoolmanagement.repository.TeacherRepository;
import com.fullstack.schoolmanagement.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindingResult;
import org.springframework.validation.Validator;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TeacherService {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserService userService; // Assuming you have a UserService for user updates

    @Autowired
    private Validator validator;

    @Transactional(readOnly = true)
    public List<TeacherDTO> getAllTeachers() {
        return teacherRepository.findAll().stream().map(teacher -> {
            TeacherDTO dto = new TeacherDTO();
            dto.setId(teacher.getId());
            dto.setUserId(teacher.getUser() != null ? teacher.getUser().getUserId() : null);
            dto.setHireDate(teacher.getHireDate() != null ? teacher.getHireDate().toString() : null);
            dto.setFirstName(teacher.getFirstName());
            dto.setLastName(teacher.getLastName());
            dto.setPhone(teacher.getPhone());
            dto.setSpecialization(teacher.getSpecialization());
            dto.setAddress(teacher.getAddress());
            dto.setExperience(teacher.getExperience());
            dto.setQualification(teacher.getQualification());
            dto.setGender(teacher.getGender());
            dto.setEmail(teacher.getUser() != null ? teacher.getUser().getEmail() : null);
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Teacher> getTeacherById(Long id) {
        return teacherRepository.findById(id);
    }

    @Transactional
    public void deleteTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + id));

        for (SchoolClass schoolClass : new HashSet<>(teacher.getClasses())) {
            schoolClass.getTeachers().remove(teacher);
        }


        teacherRepository.delete(teacher);
    }

    // This is the correct and only update method, using a DTO.
    @Transactional
    public Teacher updateTeacher(Long id, TeacherDTO teacherDTO) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + id));

        teacher.setFirstName(teacherDTO.getFirstName());
        teacher.setLastName(teacherDTO.getLastName());
        teacher.setSpecialization(teacherDTO.getSpecialization());
        teacher.setPhone(teacherDTO.getPhone());
        teacher.setAddress(teacherDTO.getAddress());
        teacher.setQualification(teacherDTO.getQualification());
        teacher.setExperience(teacherDTO.getExperience());
        teacher.setGender(teacherDTO.getGender());

        if (teacherDTO.getHireDate() != null && !teacherDTO.getHireDate().isEmpty()) {
            teacher.setHireDate(LocalDate.parse(teacherDTO.getHireDate()));
        } else {
            teacher.setHireDate(null);
        }

        if (teacher.getUser() != null && teacherDTO.getEmail() != null) {
            teacher.getUser().setEmail(teacherDTO.getEmail());
        }

        // Manual validation before save
        BindingResult bindingResult = new BeanPropertyBindingResult(teacher, "teacher");
        validator.validate(teacher, bindingResult);
        if (bindingResult.hasErrors()) {
            String message = bindingResult.getAllErrors().get(0).getDefaultMessage();
            throw new RuntimeException(message);
        }

        return teacherRepository.save(teacher);
    }
}