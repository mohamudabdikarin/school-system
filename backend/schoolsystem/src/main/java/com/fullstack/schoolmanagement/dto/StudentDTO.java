package com.fullstack.schoolmanagement.dto;

import lombok.Data;

import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

@Data
public class StudentDTO {
    private Long id;
    @NotBlank(message = "First name is required")
    private String firstName;
    @NotBlank(message = "Last name is required")
    private String lastName;
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    @Pattern(
        regexp = "^(0(61|62|68|77)\\d{7}|(61|62|68|77)\\d{7})$",
        message = "Phone number must start with 061, 062, 068, or 077 and be 10 digits, or start with 61, 62, 68, or 77 and be 9 digits."
    )
    @NotBlank(message = "Phone number is required")
    private String phone;
    private LocalDate dateOfBirth;
    @NotBlank(message = "Gender is required")
    private String gender;
    private LocalDate admissionDate;
    private Long classId; // Assuming classId is used instead of SchoolClass object
    private Long sessionId; // Assuming sessionId is used instead of AcademicSession object
    private String userId; // Now using userId as String
    private String className; // For API responses
    @NotBlank(message = "Address is required")
    private String address;
    private boolean active;
}
