package com.rce.complaint_box.controller;

import java.util.List;

import com.rce.complaint_box.dto.ComplaintTypeRequest;
import com.rce.complaint_box.model.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.rce.complaint_box.model.ComplaintType;
import com.rce.complaint_box.service.ComplaintTypesService;
import com.rce.complaint_box.utils.ResponseFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/complaint-types")
@RequiredArgsConstructor
public class ComplaintTypesController {

    private final ComplaintTypesService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ComplaintType>>> getAllComplaintTypes() {
        List<ComplaintType> types = service.getAllComplaintTypes();
        return ResponseFactory.success("Complaint types retrieved successfully.", types);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<ComplaintType>> addComplaintType(
            @Valid @RequestBody ComplaintTypeRequest request) {
        ComplaintType saved = service.addComplaintType(request);
        return ResponseFactory.success("Complaint type saved successfully.", saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping
    public ResponseEntity<ApiResponse<ComplaintType>> updateComplaintType(
            @Valid @RequestBody ComplaintTypeRequest request) {
        ComplaintType saved = service.updateComplaintType(request);
        return ResponseFactory.success("Complaint type updated successfully.", saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteComplaintType(@RequestParam Long id) {
        service.deleteComplaintType(id);
        return ResponseFactory.success("Complaint type deleted successfully.");
    }
}
