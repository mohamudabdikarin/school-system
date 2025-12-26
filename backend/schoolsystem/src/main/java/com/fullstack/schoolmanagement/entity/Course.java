package com.fullstack.schoolmanagement.entity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Set;

@Entity
@Table(name = "courses")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
//marka object xogta soo qaady u badli rabo json waxa lagu soo dara wax la dhaho hibrnate ay adkaneyso
//in laga dhigo json markaas loo istcmaala @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String courseCode; // e.g., "CS101", "MA203"

    @Column(nullable = false)
    private String courseName;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;
}
