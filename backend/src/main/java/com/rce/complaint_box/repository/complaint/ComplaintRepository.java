package com.rce.complaint_box.repository.complaint;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.rce.complaint_box.model.Complaint;
import com.rce.complaint_box.model.enums.ComplaintStatus;

@Repository
public interface ComplaintRepository extends MongoRepository<Complaint, Long>, ComplaintCustomRepository {

  List<Complaint> findByComplaintTypeId(Long complaintTypeId);

  List<Complaint> findByStatus(ComplaintStatus status);

  List<Complaint> findByRaisedBy(String raisedBy);

  void deleteByRaisedFromDepartment(String raisedFromDepartment);

  void deleteByRaisedFromDepartmentAndRaisedFromSection(String raisedFromDepartment, String raisedFromSection);

  boolean existsByRaisedBy(Long id);

  boolean existsByRaisedBy(String rollNumber);

  void deleteByComplaintTypeId(Long complaintTypeId);
}
