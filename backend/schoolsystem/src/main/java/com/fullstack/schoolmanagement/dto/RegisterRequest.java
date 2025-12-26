package com.fullstack.schoolmanagement.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    @NotBlank(message = "Role is required")
    private String role;
    // Fields for Student/Teacher details
    @NotBlank(message = "First name is required")
    private String firstName;
    @NotBlank(message = "Last name is required")
    private String lastName;
    private String dateOfBirth;
    private String gender;
    @Pattern(
        regexp = "^(0(61|62|68|77)\\d{7}|(61|62|68|77)\\d{7})$",
        message = "Invalid number. Please enter a valid number."
    )
    @NotBlank(message = "Phone number is required")
    private String phone;
    private String admissionDate; // For students
    private String hireDate; // For teachers
    private String specialization;
    private String address;
    private String qualification;
    private Integer experience;
    private Long classId; // For student registration: class assignment
} 