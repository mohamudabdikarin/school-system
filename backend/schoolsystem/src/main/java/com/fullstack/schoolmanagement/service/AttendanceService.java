package com.fullstack.schoolmanagement.service;

import com.fullstack.schoolmanagement.dto.AttendanceDTO;
import com.fullstack.schoolmanagement.dto.AttendanceMarkRequest;
import com.fullstack.schoolmanagement.entity.*;
import com.fullstack.schoolmanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private PeriodRepository periodRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Transactional
    public List<AttendanceDTO> markAttendance(AttendanceMarkRequest request, String teacherUserId) {
        SchoolClass schoolClass = classRepository.findById(request.getClassId())
            .orElseThrow(() -> new RuntimeException("Class not found"));
        
        Course course = courseRepository.findById(request.getCourseId())
            .orElseThrow(() -> new RuntimeException("Course not found"));
        
        Period period = periodRepository.findById(request.getPeriodId())
            .orElseThrow(() -> new RuntimeException("Period not found"));
        
        Teacher teacher = teacherRepository.findByUser_UserId(teacherUserId)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));

        List<Attendance> attendances = new ArrayList<>();

        for (AttendanceMarkRequest.StudentAttendance studentAtt : request.getStudents()) {
            Student student = studentRepository.findById(studentAtt.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

            // Check if attendance already exists
            Optional<Attendance> existingAttendance = attendanceRepository
                .findByStudentIdAndSchoolClassIdAndCourseIdAndPeriodIdAndAttendanceDate(
                    student.getId(), schoolClass.getId(), course.getId(), 
                    period.getId(), request.getAttendanceDate());

            Attendance attendance;
            if (existingAttendance.isPresent()) {
                attendance = existingAttendance.get();
                attendance.setPresent(studentAtt.getPresent());
                attendance.setRemarks(studentAtt.getRemarks());
            } else {
                attendance = new Attendance();
                attendance.setStudent(student);
                attendance.setSchoolClass(schoolClass);
                attendance.setCourse(course);
                attendance.setPeriod(period);
                attendance.setAttendanceDate(request.getAttendanceDate());
                attendance.setPresent(studentAtt.getPresent());
                attendance.setRemarks(studentAtt.getRemarks());
            }
            attendance.setMarkedBy(teacher);
            attendances.add(attendanceRepository.save(attendance));
        }

        return attendances.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByClassAndDate(Long classId, Long courseId, Long periodId, LocalDate date) {
        return attendanceRepository.findBySchoolClassIdAndCourseIdAndPeriodIdAndAttendanceDate(
            classId, courseId, periodId, date)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getStudentAttendance(Long studentId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByStudentIdAndAttendanceDateBetween(studentId, startDate, endDate)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    private AttendanceDTO convertToDTO(Attendance attendance) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setStudentId(attendance.getStudent().getId());
        dto.setStudentName(attendance.getStudent().getFirstName() + " " + attendance.getStudent().getLastName());
        dto.setClassId(attendance.getSchoolClass().getId());
        dto.setClassName(attendance.getSchoolClass().getName());
        dto.setCourseId(attendance.getCourse().getId());
        dto.setCourseName(attendance.getCourse().getCourseName());
        dto.setPeriodId(attendance.getPeriod().getId());
        dto.setPeriodName("Period " + attendance.getPeriod().getPeriodNumber() + " - " + attendance.getPeriod().getCourse().getCourseName());
        dto.setAttendanceDate(attendance.getAttendanceDate());
        dto.setPresent(attendance.getPresent());
        if (attendance.getMarkedBy() != null) {
            dto.setMarkedByName(attendance.getMarkedBy().getFirstName() + " " + attendance.getMarkedBy().getLastName());
        }
        dto.setRemarks(attendance.getRemarks());
        return dto;
    }
}
