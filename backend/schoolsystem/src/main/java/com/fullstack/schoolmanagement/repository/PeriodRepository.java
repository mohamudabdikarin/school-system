package com.fullstack.schoolmanagement.repository;

import com.fullstack.schoolmanagement.entity.Period;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PeriodRepository extends JpaRepository<Period, Long> {
    List<Period> findBySchoolClassIdOrderByPeriodNumberAsc(Long classId);
    List<Period> findBySchoolClassIdAndDayOfWeekOrderByPeriodNumberAsc(Long classId, String dayOfWeek);
}
