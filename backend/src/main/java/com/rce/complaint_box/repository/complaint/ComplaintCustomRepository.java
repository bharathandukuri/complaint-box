package com.rce.complaint_box.repository.complaint;

import java.util.List;

import com.rce.complaint_box.dto.ComplaintQuery;
import com.rce.complaint_box.model.Complaint;

public interface ComplaintCustomRepository {
    public List<Complaint> getComplaintsByComplaintQuery(ComplaintQuery complaintQuery);
}
