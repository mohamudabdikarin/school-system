package com.fullstack.schoolmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter; 
import lombok.Setter; 
import lombok.ToString;
import java.util.Objects; // Import this
import java.time.LocalDate;
import java.util.Set;
import java.util.HashSet; // Import this

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;


@Entity
@Getter      
@Setter      
@ToString(exclude = {"user", "courses", "classes"})
@Table(name = "teachers")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    @JsonIgnore
    private User user;

    private String firstName;
    private String lastName;
    private String email;
    @Column(unique = true)
    private String phone;
    private String specialization;
    private String address;
    private String qualification;
    private Integer experience;
    private LocalDate hireDate;
    private String gender;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Course> courses = new HashSet<>();

    @ManyToMany(mappedBy = "teachers")
    @JsonIgnore
    private Set<SchoolClass> classes = new HashSet<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Teacher teacher = (Teacher) o;
        return id != null && id.equals(teacher.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }


    // Subjects this teacher can teach
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "teacher_courses",
            joinColumns = @JoinColumn(name = "teacher_id"),
            inverseJoinColumns = @JoinColumn(name = "course_id"))
    private Set<Course> teachableCourses;

    // Classes this teacher is assigned to
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "teacher_classes",
            joinColumns = @JoinColumn(name = "teacher_id"),
            inverseJoinColumns = @JoinColumn(name = "class_id"))
    private Set<SchoolClass> assignedClasses;

    public Set<SchoolClass> getAssignedClasses() {
        if (assignedClasses == null) assignedClasses = new HashSet<>();
        return assignedClasses;
    }

    public void assignToClass(SchoolClass schoolClass) {
        if (assignedClasses == null) assignedClasses = new HashSet<>();
        assignedClasses.add(schoolClass);
        if (schoolClass.getTeachers() == null) schoolClass.setTeachers(new HashSet<>());
        schoolClass.getTeachers().add(this);
    }
    public void unassignFromClass(SchoolClass schoolClass) {
        if (assignedClasses != null) assignedClasses.remove(schoolClass);
        if (schoolClass.getTeachers() != null) schoolClass.getTeachers().remove(this);
    }
}
