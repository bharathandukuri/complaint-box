package com.rce.complaint_box.repository;

import com.rce.complaint_box.AbstractIntegrationTest;
import com.rce.complaint_box.dto.UserDTO;
import com.rce.complaint_box.dto.UserQuery;
import com.rce.complaint_box.model.StudentDetails;
import com.rce.complaint_box.model.User;
import com.rce.complaint_box.model.enums.Role;
import com.rce.complaint_box.repository.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UserRepositoryIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void cleanDatabase() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("findConflictingUsers identifies conflicting username and email in MongoDB")
    void findConflictingUsers_DetectsConflicts() {
        User existing = new User();
        existing.setId(1L);
        existing.setUsername("alice");
        existing.setEmail("alice@test.com");
        existing.setName("Alice");
        existing.setRole(Role.STUDENT);
        StudentDetails sd = new StudentDetails();
        sd.setRollNumber("20RCE101");
        sd.setDepartment("CSE");
        sd.setSection("A");
        existing.setStudentDetails(sd);
        userRepository.save(existing);

        UserDTO conflictDto = new UserDTO();
        conflictDto.setUsername("alice");
        conflictDto.setEmail("different@test.com");
        conflictDto.setRole(Role.STUDENT);
        StudentDetails newSd = new StudentDetails();
        newSd.setRollNumber("20RCE999");
        conflictDto.setStudentDetails(newSd);

        List<User> conflicts = userRepository.findConflictingUsers(conflictDto, null);

        assertThat(conflicts).isNotEmpty();
        assertThat(conflicts.get(0).getUsername()).isEqualTo("alice");
    }

    @Test
    @DisplayName("findConflictingUsers excludes the current user ID during updates")
    void findConflictingUsers_ExcludesCurrentUserId() {
        User existing = new User();
        existing.setId(1L);
        existing.setUsername("bob");
        existing.setEmail("bob@test.com");
        existing.setName("Bob");
        existing.setRole(Role.STUDENT);
        userRepository.save(existing);

        UserDTO updateDto = new UserDTO();
        updateDto.setId(1L);
        updateDto.setUsername("bob");
        updateDto.setEmail("bob@test.com");

        List<User> conflicts = userRepository.findConflictingUsers(updateDto, 1L);

        assertThat(conflicts).isEmpty();
    }

    @Test
    @DisplayName("getUsersByUserQuery filters by role, department, and pagination")
    void getUsersByUserQuery_AppliesFiltersCorrectly() {
        for (int i = 1; i <= 5; i++) {
            User u = new User();
            u.setId((long) i);
            u.setUsername("student_" + i);
            u.setEmail("student" + i + "@test.com");
            u.setName("Student Number " + i);
            u.setRole(Role.STUDENT);
            StudentDetails sd = new StudentDetails();
            sd.setRollNumber("20RCE" + i);
            sd.setDepartment("CSE");
            sd.setSection("A");
            u.setStudentDetails(sd);
            userRepository.save(u);
        }

        User mentor = new User();
        mentor.setId(6L);
        mentor.setUsername("mentor_1");
        mentor.setEmail("mentor1@test.com");
        mentor.setName("Mentor One");
        mentor.setRole(Role.MENTOR);
        userRepository.save(mentor);

        UserQuery query = new UserQuery();
        query.role = "STUDENT";
        query.department = "CSE";
        query.section = "A";
        query.size = 10;

        List<User> students = userRepository.getUsersByUserQuery(query);

        assertThat(students).hasSize(5);
        assertThat(students).allMatch(u -> u.getRole() == Role.STUDENT);
    }
}
