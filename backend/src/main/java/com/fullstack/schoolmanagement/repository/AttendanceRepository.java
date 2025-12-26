package com.fullstack.schoolmanagement.repository;

import com.fullstack.schoolmanagement.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    List<Attendance> findBySchoolClassIdAndCourseIdAndPeriodIdAndAttendanceDate(
        Long classId, Long courseId, Long periodId, LocalDate date);
    
    Optional<Attendance> findByStudentIdAndSchoolClassIdAndCourseIdAndPeriodIdAndAttendanceDate(
        Long studentId, Long classId, Long courseId, Long periodId, LocalDate date);
    
    List<Attendance> findByStudentIdAndAttendanceDateBetween(
        Long studentId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT a FROM Attendance a WHERE a.schoolClass.id = :classId AND a.attendanceDate BETWEEN :startDate AND :endDate")
    List<Attendance> findByClassAndDateRange(
        @Param("classId") Long classId, 
        @Param("startDate") LocalDate startDate, 
        @Param("endDate") LocalDate endDate);
}
