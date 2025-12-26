package com.fullstack.schoolmanagement.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
@Getter
@Setter
public class TeacherDTO {
    private Long id;
    private String userId;
    private String hireDate;
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
    @NotBlank(message = "Specialization is required")
    private String specialization;
    @NotBlank(message = "Address is required")
    private String address;
    @NotBlank(message = "Qualification is required")
    private String qualification;
    @NotNull(message = "Experience is required")
    private Integer experience;
    @NotBlank(message = "Gender is required")
    private String gender;
} 