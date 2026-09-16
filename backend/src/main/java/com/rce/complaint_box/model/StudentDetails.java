package com.rce.complaint_box.model;

import org.springframework.data.mongodb.core.index.Indexed;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentDetails {
    @Indexed(unique = true, sparse = true)
    private String rollNumber;

    @Indexed
    private String department;

    @Indexed
    private String section;

    @Indexed
    private String academicYear;
}
