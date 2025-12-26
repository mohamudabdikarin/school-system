package com.fullstack.schoolmanagement.service;

import com.fullstack.schoolmanagement.dto.LoginRequest;
import com.fullstack.schoolmanagement.dto.LoginResponse;
import com.fullstack.schoolmanagement.dto.RegisterRequest;
import com.fullstack.schoolmanagement.dto.RegisterResponse;
import com.fullstack.schoolmanagement.entity.Student;
import com.fullstack.schoolmanagement.entity.Teacher;
import com.fullstack.schoolmanagement.entity.User;
import com.fullstack.schoolmanagement.entity.SchoolClass;
import com.fullstack.schoolmanagement.repository.StudentRepository;
import com.fullstack.schoolmanagement.repository.TeacherRepository;
import com.fullstack.schoolmanagement.repository.UserRepository;
import com.fullstack.schoolmanagement.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Service
public class AuthService {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserDetailsService userDetailsService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private TeacherRepository teacherRepository;
    @Autowired
    private SchoolClassService schoolClassService;
    @Autowired
    private PasswordEncoder passwordEncoder;


    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUserId(), loginRequest.getPassword())
        );
        final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUserId());
        final String jwt = jwtUtil.generateToken(userDetails);
        return new LoginResponse(jwt, userDetails.getUsername(), userDetails.getAuthorities().iterator().next().getAuthority());
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
      
        String role = request.getRole();
        if (role == null || !role.startsWith("ROLE_")) {
            throw new IllegalArgumentException("Invalid or missing role. Must start with ROLE_");
        }

        String userId = generateNextUserId(role);
        String password;
        if ("ROLE_ADMIN".equalsIgnoreCase(role)) {
            password = "1234";
        } else {
            password = generateRandomPassword();
        }

        // Print the raw password before encryption
        System.out.println("Generated password for user " + userId + ": " + password);
        // Save the raw password to password.txt
        try (FileWriter writer = new FileWriter("password.txt", true)) {
            writer.write("User: " + userId + ", Password: " + password + System.lineSeparator());
        } catch (IOException e) {
            System.err.println("Failed to write password to file: " + e.getMessage());
        }

        // Encrypt the password
        String encodedPassword = passwordEncoder.encode(password);

        User user = new User();
        user.setUserId(userId);
        user.setPassword(encodedPassword);
        user.setRole(role);
        user.setActive(true);
        user.setEmail(request.getEmail());


        if ("ROLE_STUDENT".equalsIgnoreCase(role)) {
            Student student = getStudent(request, user);
            studentRepository.save(student);
        } else if ("ROLE_TEACHER".equalsIgnoreCase(role)) {
            Teacher teacher = new Teacher();
            teacher.setUser(user);
            teacher.setFirstName(request.getFirstName());
            teacher.setLastName(request.getLastName());
            teacher.setPhone(request.getPhone());
            teacher.setSpecialization(request.getSpecialization());
            teacher.setAddress(request.getAddress());
            teacher.setQualification(request.getQualification());
            teacher.setExperience(request.getExperience());
            teacher.setGender(request.getGender());
            if (request.getHireDate() != null && !request.getHireDate().isEmpty()) {
                teacher.setHireDate(java.time.LocalDate.parse(request.getHireDate()));
            }
            teacherRepository.save(teacher);
        } else {
            userRepository.save(user);
        }

        return new RegisterResponse(userId, password, "User registered successfully.");
    }

    private Student getStudent(RegisterRequest request, User user) {
        Student student = new Student();
        student.setUser(user); // User is not saved yet, but will be by cascade
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        if (request.getDateOfBirth() != null) {
            student.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
        }
        if (request.getAdmissionDate() != null) {
            student.setAdmissionDate(LocalDate.parse(request.getAdmissionDate()));
        }
        student.setGender(request.getGender());
        student.setPhone(request.getPhone());
        student.setActive(true);
        student.setAddress(request.getAddress());
        if (request.getClassId() != null) {
            SchoolClass schoolClass = schoolClassService.getSchoolClassById(request.getClassId().longValue());
            if (schoolClass != null) {
                student.setSchoolClass(schoolClass);
            }
        }
        return student;
    }

    private String generateNextUserId(String role) {
        String prefix;
        switch (role) {
            case "ROLE_ADMIN": prefix = "ADM-"; break;
            case "ROLE_TEACHER": prefix = "TCH-"; break;
            case "ROLE_STUDENT": prefix = "STD-"; break;
            default: throw new IllegalArgumentException("Unknown role: " + role);
        }
        // Find the max number for this role
        List<User> users = userRepository.findByRole(role);
        int max = users.stream()
            .map(User::getUserId)
            .filter(id -> id != null && id.startsWith(prefix))
            .mapToInt(id -> {
                try {
                    return Integer.parseInt(id.substring(prefix.length()));
                } catch (Exception e) {
                    return 0;
                }
            })
            .max().orElse(0);
        return prefix + (max + 1);
    }

    private String generateRandomPassword() {
        int pwd = 1000 + new java.util.Random().nextInt(9000);
        return String.valueOf(pwd);
    }

}