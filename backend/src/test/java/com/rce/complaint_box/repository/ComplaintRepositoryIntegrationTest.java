package com.rce.complaint_box.repository;

import com.rce.complaint_box.AbstractIntegrationTest;
import com.rce.complaint_box.dto.ComplaintQuery;
import com.rce.complaint_box.model.Complaint;
import com.rce.complaint_box.model.enums.ComplaintStatus;
import com.rce.complaint_box.repository.complaint.ComplaintRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ComplaintRepositoryIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private ComplaintRepository complaintRepository;

    @BeforeEach
    void cleanDatabase() {
        complaintRepository.deleteAll();
    }

    @Test
    @DisplayName("getComplaintsByComplaintQuery filters by status and department")
    void getComplaintsByComplaintQuery_FiltersCorrectly() {
        Complaint c1 = new Complaint();
        c1.setId(1L);
        c1.setTitle("Broken light");
        c1.setStatus(ComplaintStatus.PENDING);
        c1.setRaisedFromDepartment("CSE");
        c1.setRaisedFromSection("A");
        c1.setRaisedBy("20RCE001");
        complaintRepository.save(c1);

        Complaint c2 = new Complaint();
        c2.setId(2L);
        c2.setTitle("Water leakage");
        c2.setStatus(ComplaintStatus.RESOLVED);
        c2.setRaisedFromDepartment("CSE");
        c2.setRaisedFromSection("A");
        c2.setRaisedBy("20RCE002");
        complaintRepository.save(c2);

        Complaint c3 = new Complaint();
        c3.setId(3L);
        c3.setTitle("Projector issue");
        c3.setStatus(ComplaintStatus.PENDING);
        c3.setRaisedFromDepartment("ECE");
        c3.setRaisedFromSection("B");
        c3.setRaisedBy("20RCE050");
        complaintRepository.save(c3);

        ComplaintQuery query = new ComplaintQuery();
        query.status = "PENDING";
        query.studentDepartment = "CSE";
        query.studentSection = "A";
        query.size = 10;

        List<Complaint> results = complaintRepository.getComplaintsByComplaintQuery(query);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo(1L);
        assertThat(results.get(0).getTitle()).isEqualTo("Broken light");
    }
}
