package com.rce.complaint_box.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AssignedDepartmentDetails {
    private String code;
    private List<String> sections;
}
