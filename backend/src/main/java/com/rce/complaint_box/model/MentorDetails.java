package com.rce.complaint_box.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.mongodb.core.index.Indexed;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class MentorDetails {
    @Indexed(unique = true, sparse = true)
    private String employeeID;
    private String designation;

    @Indexed
    private String department;

    private List<AssignedDepartmentDetails> assignedDepartments = new ArrayList<>();
}