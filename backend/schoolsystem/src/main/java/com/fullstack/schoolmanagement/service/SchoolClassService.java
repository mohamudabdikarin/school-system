package com.fullstack.schoolmanagement.service;

import com.fullstack.schoolmanagement.entity.SchoolClass;
import com.fullstack.schoolmanagement.repository.ClassRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SchoolClassService {
    @Autowired
    private ClassRepository classRepository;

    public SchoolClass getSchoolClassById(Long id) {
        return classRepository.findById(id).orElse(null);
    }
}
