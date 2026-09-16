package com.rce.complaint_box.repository.user;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.rce.complaint_box.model.User;
import com.rce.complaint_box.model.enums.Role;

import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, Long>, UserCustomRepository {

    public Optional<User> findByUsername(String username);

    public boolean existsByUsername(String username);

    public boolean existsByEmail(String email);

    public boolean existsByStudentDetailsRollNumber(String rollNumber);

    public boolean existsByMentorDetailsEmployeeID(String employeeID);

    public Optional<User> findByStudentDetailsRollNumber(String rollNumber);

    public Optional<User> findByMentorDetailsEmployeeID(String employeeID);

    Optional<User> findByUsernameAndRole(String username, Role role);

    public boolean existsByRole(Role admin);

    void deleteByStudentDetailsDepartment(String department);
    void deleteByMentorDetailsDepartment(String department);

    void deleteByStudentDetailsDepartmentAndStudentDetailsSection(String department, String section);

}
