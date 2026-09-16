package com.rce.complaint_box.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ComplaintDetails {
    private Integer totalComplaints;
    private Integer totalPending;
    private Integer totalInProgress;
    private Integer totalResolved;
    private Integer totalRejected;
    private Integer totalEscalated;

    private List<Complaint> recentComplaints;
}
