package com.rce.complaint_box.controller;

import java.util.List;

import com.rce.complaint_box.dto.DepartmentRequest;
import com.rce.complaint_box.model.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.rce.complaint_box.model.Department;
import com.rce.complaint_box.service.DepartmentService;
import com.rce.complaint_box.utils.ResponseFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Department>>> getDepartments() {
        List<Department> departments = service.getDepartments();
        return ResponseFactory.success("Departments fetched successfully.", departments);
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<Department>> getDepartment(@PathVariable String code) {
        Department department = service.getDepartmentByCode(code);
        return ResponseFactory.success("Department fetched successfully.", department);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<Department>> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        Department department = service.createDepartment(request);
        return ResponseFactory.success("Department created successfully.", department);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{code}")
    public ResponseEntity<ApiResponse<Department>> updateDepartment(
            @PathVariable String code,
            @Valid @RequestBody DepartmentRequest request) {
        Department department = service.updateDepartment(code, request);
        return ResponseFactory.success("Department updated successfully.", department);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{code}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable String code) {
        service.deleteDepartment(code);
        return ResponseFactory.success("Department deleted successfully.");
    }
}
