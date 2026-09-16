package com.rce.complaint_box.controller;

import java.util.List;

import com.rce.complaint_box.model.ApiResponse;
import com.rce.complaint_box.model.User;
import com.rce.complaint_box.security.model.AppUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rce.complaint_box.dto.ComplaintQuery;
import com.rce.complaint_box.model.Complaint;
import com.rce.complaint_box.model.ComplaintAction;
import com.rce.complaint_box.service.ComplaintService;
import com.rce.complaint_box.utils.ResponseFactory;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<Complaint>>> getStudentComplaints(
            @AuthenticationPrincipal AppUserDetails userDetails) {
        User user = userDetails.getUser();
        List<Complaint> complaints = complaintService.getStudentComplaints(user);
        return ResponseFactory.success("Complaints retrieved successfully", complaints);
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping
    public ResponseEntity<ApiResponse<Complaint>> addComplaint(@RequestBody Complaint complaint,
            @AuthenticationPrincipal AppUserDetails userDetails) {
        User user = userDetails.getUser();
        Complaint saved = complaintService.addComplaint(complaint, user);
        return ResponseFactory.success("Complaint placed successfully.", saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComplaint(
            @PathVariable("id") Long complaintId,
            @AuthenticationPrincipal AppUserDetails userDetails) {
        User user = userDetails.getUser();
        complaintService.deleteComplaint(complaintId, user);
        return ResponseFactory.success("Complaint deleted successfully.");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Complaint>> getComplaintById(
            @PathVariable("id") Long complaintId,
            @AuthenticationPrincipal AppUserDetails userDetails) {
        User user = userDetails.getUser();
        Complaint complaint = complaintService.getComplaintById(complaintId, user);
        return ResponseFactory.success("Complaint retrieved successfully", complaint);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MENTOR')")
    @PostMapping("/{id}/actions")
    public ResponseEntity<ApiResponse<Complaint>> takeAction(
            @PathVariable Long id,
            @RequestBody ComplaintAction action,
            @AuthenticationPrincipal AppUserDetails userDetails) {
        Complaint complaint = complaintService.addAction(id, action, userDetails.getUser());
        return ResponseFactory.success("Complaint action added.", complaint);
    }

    @GetMapping("/{id}/actions")
    public List<ComplaintAction> getActions(@PathVariable Long id) {
        return complaintService.getActionsByComplaintId(id);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MENTOR')")
    public List<Complaint> getComplaints(
            @RequestParam(required = false) String studentRollNumber,
            @RequestParam(required = false, defaultValue = "ALL") String studentDepartment,
            @RequestParam(required = false, defaultValue = "ALL") String studentSection,
            @RequestParam(required = false) String employeeID,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false) Long type,
            @RequestParam(required = false) Long lastID,
            @RequestParam(defaultValue = "20") Integer size,
            @AuthenticationPrincipal AppUserDetails userDetails) {
        ComplaintQuery query = new ComplaintQuery();
        query.studentRollNumber = studentRollNumber;
        query.studentDepartment = studentDepartment;
        query.studentSection = studentSection;
        query.employeeID = employeeID;
        query.status = status;
        query.type = type;
        query.lastID = lastID;
        query.size = size;
        User user = userDetails.getUser();

        return complaintService.getComplaints(query, user);
    }
}
