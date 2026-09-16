package com.rce.complaint_box.repository.complaint;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import com.rce.complaint_box.dto.ComplaintQuery;
import com.rce.complaint_box.model.Complaint;
import com.rce.complaint_box.repository.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ComplaintRepositoryImpl implements ComplaintCustomRepository {

    private final MongoTemplate mongoTemplate;
    private final UserRepository userRepository;

    @Override
    public List<Complaint> getComplaintsByComplaintQuery(ComplaintQuery q) {
        Query query = new Query();

        if (q.status != null && !"ALL".equalsIgnoreCase(q.status)) {
            query.addCriteria(Criteria.where("status").is(q.status));
        }

        if (q.type != null) {
            query.addCriteria(Criteria.where("complaintTypeId").is(q.type));
        }

        if (q.studentRollNumber != null && !q.studentRollNumber.isBlank()) {
            query.addCriteria(Criteria.where("raisedBy").regex(q.studentRollNumber, "i"));
        }

        if (q.studentDepartment != null && !"ALL".equalsIgnoreCase(q.studentDepartment)) {
            if (q.studentSection != null && !"ALL".equalsIgnoreCase(q.studentSection)) {
                query.addCriteria(Criteria.where("raisedFromDepartment").is(q.studentDepartment)
                        .and("raisedFromSection").is(q.studentSection));
            } else {
                query.addCriteria(Criteria.where("raisedFromDepartment").is(q.studentDepartment));
            }
        }

        if (q.employeeID != null && !q.employeeID.isBlank()) {
            var userOpt = userRepository.findByMentorDetailsEmployeeID(q.employeeID);
            if (userOpt.isPresent()) {
                var user = userOpt.get();
                List<Criteria> orList = new ArrayList<>();

                user.getMentorDetails().getAssignedDepartments().forEach(department -> {
                    department.getSections().forEach(section -> {
                        orList.add(Criteria.where("raisedFromDepartment").is(department.getCode())
                                .and("raisedFromSection").is(section));
                    });
                });

                if (!orList.isEmpty()) {
                    query.addCriteria(new Criteria().orOperator(orList));
                }
            }
        }

        if (q.lastID != null) {
            query.addCriteria(Criteria.where("_id").lt(q.lastID));
        }

        query.with(Sort.by(Sort.Direction.DESC, "_id"));
        query.limit(q.size != null ? q.size : 20);

        return mongoTemplate.find(query, Complaint.class);
    }

}
