package com.fullstack.schoolmanagement.controller;

import com.fullstack.schoolmanagement.dto.PeriodDTO;
import com.fullstack.schoolmanagement.service.PeriodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/periods")
@CrossOrigin(origins = "*")
public class PeriodController {

    @Autowired
    private PeriodService periodService;

    @GetMapping
    public ResponseEntity<List<PeriodDTO>> getAllPeriods() {
        return ResponseEntity.ok(periodService.getAllPeriods());
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<PeriodDTO>> getPeriodsByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(periodService.getPeriodsByClass(classId));
    }

    @GetMapping("/class/{classId}/day/{dayOfWeek}")
    public ResponseEntity<List<PeriodDTO>> getPeriodsByClassAndDay(
            @PathVariable Long classId, 
            @PathVariable String dayOfWeek) {
        return ResponseEntity.ok(periodService.getPeriodsByClassAndDay(classId, dayOfWeek));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PeriodDTO> getPeriodById(@PathVariable Long id) {
        return ResponseEntity.ok(periodService.getPeriodById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PeriodDTO> createPeriod(@RequestBody PeriodDTO periodDTO) {
        return ResponseEntity.ok(periodService.createPeriod(periodDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PeriodDTO> updatePeriod(@PathVariable Long id, @RequestBody PeriodDTO periodDTO) {
        return ResponseEntity.ok(periodService.updatePeriod(id, periodDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePeriod(@PathVariable Long id) {
        periodService.deletePeriod(id);
        return ResponseEntity.noContent().build();
    }
}
