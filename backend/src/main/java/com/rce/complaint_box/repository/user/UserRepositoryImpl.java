package com.rce.complaint_box.repository.user;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import com.rce.complaint_box.dto.UserDTO;
import com.rce.complaint_box.dto.UserQuery;
import com.rce.complaint_box.model.User;
import com.rce.complaint_box.model.enums.Role;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserCustomRepository {

    private final MongoTemplate mongoTemplate;

    @PostConstruct
    public void init() {
        System.out.println("UserRepository bean created!");
    }

    @Override
    public List<User> getUsersByUserQuery(UserQuery queryDto) {
        Query query = new Query();

        if (!"ALL".equalsIgnoreCase(queryDto.getRole())) {
            query.addCriteria(Criteria.where("role").is(queryDto.getRole()));
        }
        if (!"ALL".equalsIgnoreCase(queryDto.getDepartment())) {
            List<Criteria> orList = new ArrayList<>();

            if (queryDto.getSection() != null && !"ALL".equalsIgnoreCase(queryDto.getSection())) {
                orList.add(Criteria.where("studentDetails.department").is(queryDto.getDepartment())
                        .and("studentDetails.section").is(queryDto.getSection()));
                orList.add(Criteria.where("mentorDetails.department").is(queryDto.getDepartment())
                        .and("mentorDetails.section").is(queryDto.getSection()));
            } else {
                orList.add(Criteria.where("studentDetails.department").is(queryDto.getDepartment()));
                orList.add(Criteria.where("mentorDetails.department").is(queryDto.getDepartment()));
            }

            query.addCriteria(new Criteria().orOperator(orList));
        }
        if (queryDto.getAcademicYear() != null && !queryDto.getAcademicYear().isEmpty()) {
            String yearInput = queryDto.getAcademicYear().trim();

            if (yearInput.matches("^\\d{4}$") || yearInput.matches("^\\d{4}-\\d{4}$")) {
                if (yearInput.matches("^\\d{4}$")) {
                    query.addCriteria(new Criteria().orOperator(
                            Criteria.where("studentDetails.academicYear").regex("^" + yearInput),
                            Criteria.where("studentDetails.academicYear").regex(yearInput + "$")));
                } else {
                    query.addCriteria(Criteria.where("studentDetails.academicYear").is(yearInput));
                }
            }
        }

        if (queryDto.getSearchKey() != null && !queryDto.getSearchKey().isEmpty()) {
            String key = queryDto.getSearchKey();
            switch (queryDto.getSearchProperty().toUpperCase()) {
                case "NAME":
                    query.addCriteria(Criteria.where("name").regex(key, "i"));
                    break;
                case "USERNAME":
                    query.addCriteria(Criteria.where("username").regex(key, "i"));
                    break;
                case "EMAIL":
                    query.addCriteria(Criteria.where("email").regex(key, "i"));
                    break;
                case "ROLLNUMBER":
                    query.addCriteria(Criteria.where("studentDetails.rollNumber").regex(key, "i"));
                    break;
                case "EMPLOYEEID":
                    query.addCriteria(Criteria.where("mentorDetails.employeeID").regex(key, "i"));
                    break;
                default:
                    break;
            }
        }

        if (queryDto.getLastID() != null) {
            query.addCriteria(Criteria.where("_id").lt(queryDto.getLastID()));
        }

        query.with(Sort.by(Sort.Direction.DESC, "_id"));
        query.limit(queryDto.getSize());

        return mongoTemplate.find(query, User.class);
    }

    @Override
    public List<User> findConflictingUsers(UserDTO dto, Long excludeId) {
        List<Criteria> criteriaList = new ArrayList<>();
        criteriaList.add(Criteria.where("username").is(dto.getUsername()));
        criteriaList.add(Criteria.where("email").is(dto.getEmail()));

        if (dto.getRole() == Role.STUDENT && dto.getStudentDetails() != null) {
            criteriaList.add(Criteria.where("studentDetails.rollNumber")
                    .is(dto.getStudentDetails().getRollNumber()));
        }
        if (dto.getRole() == Role.MENTOR && dto.getMentorDetails() != null) {
            criteriaList.add(Criteria.where("mentorDetails.employeeID")
                    .is(dto.getMentorDetails().getEmployeeID()));
        }

        Query query = new Query().addCriteria(new Criteria().orOperator(criteriaList));
        if (excludeId != null) {
            query.addCriteria(Criteria.where("_id").ne(excludeId));
        }

        return mongoTemplate.find(query, User.class);
    }

}
