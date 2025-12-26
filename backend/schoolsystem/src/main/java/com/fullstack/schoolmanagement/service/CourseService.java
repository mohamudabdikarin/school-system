package com.fullstack.schoolmanagement.service;

import com.fullstack.schoolmanagement.entity.Course;
import com.fullstack.schoolmanagement.repository.CourseRepository;
import com.fullstack.schoolmanagement.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    public Course createCourse(Course course) {
        // The teacher might be passed with just an ID.
        if (course.getTeacher() != null && course.getTeacher().getId() != null) {
            teacherRepository.findById(course.getTeacher().getId())
                .ifPresent(course::setTeacher);
        }
        // No credits logic
        return courseRepository.save(course);
    }

    @org.springframework.transaction.annotation.Transactional
    public Course updateCourse(Long id, Course courseDetails) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        course.setCourseName(courseDetails.getCourseName());
        course.setCourseCode(courseDetails.getCourseCode());
        course.setDescription(courseDetails.getDescription());
        // Removed credits logic

        if (courseDetails.getTeacher() != null && courseDetails.getTeacher().getId() != null) {
             teacherRepository.findById(courseDetails.getTeacher().getId())
                .ifPresent(course::setTeacher);
        } else {
            course.setTeacher(null);
        }
        
        return courseRepository.save(course);
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

    public Optional<Course> getCourseByCourseCode(String courseCode) {
        return courseRepository.findByCourseCode(courseCode);
    }
}