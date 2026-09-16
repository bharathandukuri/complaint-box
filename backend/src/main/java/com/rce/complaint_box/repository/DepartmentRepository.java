package com.rce.complaint_box.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.rce.complaint_box.model.Department;

public interface DepartmentRepository extends MongoRepository<Department, String> {
    boolean existsByName(String name);

    boolean existsByCode(String code);
}
