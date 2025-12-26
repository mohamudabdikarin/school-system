package com.fullstack.schoolmanagement.controller;

import com.fullstack.schoolmanagement.entity.Student;
import com.fullstack.schoolmanagement.entity.ExamResult;
import com.fullstack.schoolmanagement.repository.StudentRepository;
import com.fullstack.schoolmanagement.repository.TeacherRepository;
import com.fullstack.schoolmanagement.repository.ExamResultRepository;
import com.fullstack.schoolmanagement.repository.ClassRepository;
import com.fullstack.schoolmanagement.repository.UserRepository;
import com.fullstack.schoolmanagement.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fullstack.schoolmanagement.entity.Teacher;
import com.fullstack.schoolmanagement.entity.SchoolClass;
import com.fullstack.schoolmanagement.entity.Course;
import java.util.Set;
import java.util.Optional; // Import Optional for findByUser_UserId

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ExamResultRepository examResultRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

        long totalStudents = studentRepository.count();
        long totalTeachers = teacherRepository.count();
        long totalExamResults = examResultRepository.count();
        long totalClasses = classRepository.count();
        long totalCourses = courseRepository.count();
        long totalUsers = userRepository.count();
        long totalAdmins = userRepository.countByRole("ROLE_ADMIN"); // Assuming this method exists

        dashboard.put("totalStudents", totalStudents);
        dashboard.put("totalTeachers", totalTeachers);
        dashboard.put("totalExamResults", totalExamResults);
        dashboard.put("totalClasses", totalClasses);
        dashboard.put("totalCourses", totalCourses);
        dashboard.put("totalUsers", totalUsers);
        dashboard.put("totalAdmins", totalAdmins);

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, Object>> getTeacherDashboard(@RequestParam String teacherUserId) {
        Map<String, Object> dashboard = new HashMap<>();

        // Find the teacher by user ID
        Optional<Teacher> teacherOptional = teacherRepository.findByUser_UserId(teacherUserId); // Use Optional
        Teacher teacher = teacherOptional.orElse(null);

        if (teacher != null) {
            // Get teacher's assigned classes
            Set<SchoolClass> assignedClasses = teacher.getAssignedClasses();
            long totalClasses = assignedClasses.size();

            // Get students in teacher's classes
            long totalStudents = 0;
            for (SchoolClass schoolClass : assignedClasses) {
                totalStudents += studentRepository.countBySchoolClass(schoolClass);
            }

            // Get teacher's courses
            Set<Course> teacherCourses = teacher.getCourses();
            long totalCourses = teacherCourses.size();

            // Get exam results for teacher's students
            long totalExamResults = 0;
            for (SchoolClass schoolClass : assignedClasses) {
                List<Student> studentsInClass = studentRepository.findAllBySchoolClass(schoolClass);
                for (Student student : studentsInClass) {
                    totalExamResults += examResultRepository.countByStudent(student);
                }
            }

            dashboard.put("totalStudents", totalStudents);
            dashboard.put("totalClasses", totalClasses);
            dashboard.put("totalCourses", totalCourses);
            dashboard.put("totalExamResults", totalExamResults);
            dashboard.put("teacherId", teacher.getId()); // Assuming teacher has an ID
        } else {
            // If teacher not found, return default zeros
            dashboard.put("totalStudents", 0);
            dashboard.put("totalClasses", 0);
            dashboard.put("totalCourses", 0);
            dashboard.put("totalExamResults", 0);
            dashboard.put("teacherId", null);
            // Optionally, you could return ResponseEntity.notFound().build(); here
        }

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/student/{userId}") // Changed PathVariable to String userId
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getStudentDashboard(@PathVariable String userId) { // Changed type to String
        Map<String, Object> dashboard = new HashMap<>();
        // Find student by the authenticated user's ID
        // This assumes your Student entity has a 'user' field which links to a User entity,
        // and the User entity has a 'userId' field (e.g., String userId) that stores the auth system ID.
        Optional<Student> studentOptional = studentRepository.findByUser_UserId(userId);
        Student student = studentOptional.orElse(null);

        if (student != null) {
            List<ExamResult> examResults = examResultRepository.findByStudent(student);
            dashboard.put("student", student);
            dashboard.put("examResults", examResults);
            // Add attendancePercentage (dummy 100 for now)
            dashboard.put("attendancePercentage", 100);
            // Calculate overallAverageScore
            double avg = 0;
            if (!examResults.isEmpty()) {
                avg = examResults.stream().mapToDouble(r -> r.getMarksObtained().doubleValue()).average().orElse(0);
            }
            dashboard.put("overallAverageScore", avg);
            // Add enrolledCoursesCount
            int enrolledCourses = 0;
            if (student.getSchoolClass() != null && student.getSchoolClass().getCourses() != null) {
                enrolledCourses = student.getSchoolClass().getCourses().size();
            }
            dashboard.put("enrolledCoursesCount", enrolledCourses);
        } else {
            // If student is not found for the given userId, return 404 Not Found
            // This provides clearer feedback to the frontend
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dashboard);
    }
}
