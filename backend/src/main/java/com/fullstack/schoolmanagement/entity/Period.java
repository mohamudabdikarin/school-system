package com.fullstack.schoolmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Table(name = "periods", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"class_id", "day_of_week", "period_number"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Period {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private SchoolClass schoolClass;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private Integer periodNumber; // 1, 2, 3, etc.

    @Column(nullable = false)
    private String dayOfWeek; // MONDAY, TUESDAY, etc.
}
