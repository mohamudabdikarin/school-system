package com.fullstack.schoolmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "class_id", "course_id", "period_id", "attendance_date"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne
    @JoinColumn(name = "period_id", nullable = false)
    private Period period;

    @Column(nullable = false)
    private LocalDate attendanceDate;

    @Column(nullable = false)
    private Boolean present = false;

    @ManyToOne
    @JoinColumn(name = "marked_by")
    private Teacher markedBy;

    private String remarks;
}
