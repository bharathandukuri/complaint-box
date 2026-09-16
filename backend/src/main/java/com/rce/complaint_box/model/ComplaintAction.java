package com.rce.complaint_box.model;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ComplaintAction {
    private Long complaintID;
    private String actionType;
    private String performedBy;
    private Date performedAt;
    private String remarks;
}
