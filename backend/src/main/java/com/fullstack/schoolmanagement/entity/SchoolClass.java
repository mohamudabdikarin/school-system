package com.fullstack.schoolmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter; // Changed from Data
import lombok.Setter; // Changed from Data
import lombok.ToString; // Added
import java.util.Objects; // Import this
import java.util.Set;
import java.util.HashSet; // Import this
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Getter
@Setter
@ToString(exclude = {"teachers"})
@Table(name = "classes")
public class SchoolClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;


    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "class_teachers",
        joinColumns = @JoinColumn(name = "class_id"),
        inverseJoinColumns = @JoinColumn(name = "teacher_id")
    )
    @JsonIgnore
    private Set<Teacher> teachers = new HashSet<>();


    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "class_courses",
        joinColumns = @JoinColumn(name = "class_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private Set<Course> courses = new HashSet<>();


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SchoolClass that = (SchoolClass) o;
        // Only compare based on the ID. Handles non-saved (null id) entities.
        return id != null && id.equals(that.id);
    }
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}