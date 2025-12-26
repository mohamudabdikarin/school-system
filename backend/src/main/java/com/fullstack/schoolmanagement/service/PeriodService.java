package com.fullstack.schoolmanagement.service;

import com.fullstack.schoolmanagement.dto.PeriodDTO;
import com.fullstack.schoolmanagement.entity.Course;
import com.fullstack.schoolmanagement.entity.Period;
import com.fullstack.schoolmanagement.entity.SchoolClass;
import com.fullstack.schoolmanagement.repository.ClassRepository;
import com.fullstack.schoolmanagement.repository.CourseRepository;
import com.fullstack.schoolmanagement.repository.PeriodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PeriodService {

    @Autowired
    private PeriodRepository periodRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private CourseRepository courseRepository;

    public List<PeriodDTO> getAllPeriods() {
        return periodRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<PeriodDTO> getPeriodsByClass(Long classId) {
        return periodRepository.findBySchoolClassIdOrderByPeriodNumberAsc(classId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public List<PeriodDTO> getPeriodsByClassAndDay(Long classId, String dayOfWeek) {
        return periodRepository.findBySchoolClassIdAndDayOfWeekOrderByPeriodNumberAsc(classId, dayOfWeek).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public PeriodDTO getPeriodById(Long id) {
        Period period = periodRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Period not found"));
        return convertToDTO(period);
    }

    public PeriodDTO createPeriod(PeriodDTO periodDTO) {
        SchoolClass schoolClass = classRepository.findById(periodDTO.getClassId())
            .orElseThrow(() -> new RuntimeException("Class not found"));
        
        Course course = courseRepository.findById(periodDTO.getCourseId())
            .orElseThrow(() -> new RuntimeException("Course not found"));

        Period period = new Period();
        period.setSchoolClass(schoolClass);
        period.setCourse(course);
        period.setStartTime(periodDTO.getStartTime());
        period.setEndTime(periodDTO.getEndTime());
        period.setPeriodNumber(periodDTO.getPeriodNumber());
        period.setDayOfWeek(periodDTO.getDayOfWeek());
        
        Period saved = periodRepository.save(period);
        return convertToDTO(saved);
    }

    public PeriodDTO updatePeriod(Long id, PeriodDTO periodDTO) {
        Period period = periodRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Period not found"));
        
        SchoolClass schoolClass = classRepository.findById(periodDTO.getClassId())
            .orElseThrow(() -> new RuntimeException("Class not found"));
        
        Course course = courseRepository.findById(periodDTO.getCourseId())
            .orElseThrow(() -> new RuntimeException("Course not found"));

        period.setSchoolClass(schoolClass);
        period.setCourse(course);
        period.setStartTime(periodDTO.getStartTime());
        period.setEndTime(periodDTO.getEndTime());
        period.setPeriodNumber(periodDTO.getPeriodNumber());
        period.setDayOfWeek(periodDTO.getDayOfWeek());
        
        Period updated = periodRepository.save(period);
        return convertToDTO(updated);
    }

    public void deletePeriod(Long id) {
        periodRepository.deleteById(id);
    }

    private PeriodDTO convertToDTO(Period period) {
        PeriodDTO dto = new PeriodDTO();
        dto.setId(period.getId());
        dto.setClassId(period.getSchoolClass().getId());
        dto.setClassName(period.getSchoolClass().getName());
        dto.setCourseId(period.getCourse().getId());
        dto.setCourseName(period.getCourse().getCourseName());
        dto.setStartTime(period.getStartTime());
        dto.setEndTime(period.getEndTime());
        dto.setPeriodNumber(period.getPeriodNumber());
        dto.setDayOfWeek(period.getDayOfWeek());
        return dto;
    }
}
