package com.fullstack.schoolmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import com.fullstack.schoolmanagement.entity.SchoolClass;

@Entity
@Table(name = "students")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
//orphanRemoval remove student and its account
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    @Column(unique = true)
    private String phone;
    private LocalDate admissionDate;
    private boolean isActive = true;
    private String address;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private SchoolClass schoolClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private AcademicSession session;
//mappedby لتحديد أن العلاقة تم تعريفها في الجهة الأخرى
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExamResult> examResults;
}
