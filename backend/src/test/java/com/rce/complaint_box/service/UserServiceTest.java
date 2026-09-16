package com.rce.complaint_box.service;

import com.rce.complaint_box.dto.UserDTO;
import com.rce.complaint_box.dto.UserLoginDTO;
import com.rce.complaint_box.exception.AppException;
import com.rce.complaint_box.exception.ConflictException;
import com.rce.complaint_box.exception.NotFoundException;
import com.rce.complaint_box.exception.ValidationException;
import com.rce.complaint_box.model.AssignedDepartmentDetails;
import com.rce.complaint_box.model.MentorDetails;
import com.rce.complaint_box.model.StudentDetails;
import com.rce.complaint_box.model.User;
import com.rce.complaint_box.model.enums.ResponseCode;
import com.rce.complaint_box.model.enums.Role;
import com.rce.complaint_box.repository.complaint.ComplaintRepository;
import com.rce.complaint_box.repository.user.UserRepository;
import com.rce.complaint_box.security.jwt.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private SequenceGenerator sequenceGenerator;

    @Mock
    private ComplaintRepository complaintRepository;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userService, "jwtExpiry", 3600000L);
    }

    // ── Login Tests ─────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("Login Failure and Success Tests")
    class LoginTests {

        @Test
        @DisplayName("Login throws AppException (USER_NOT_FOUND) when username does not exist")
        void login_UserNotFound_ThrowsException() {
            UserLoginDTO dto = new UserLoginDTO("nonexistent", "secret123");
            when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.login(dto))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getCode()).isEqualTo(ResponseCode.USER_NOT_FOUND);
                    });
        }

        @Test
        @DisplayName("Login throws AppException (INVALID_CREDENTIALS) when password does not match")
        void login_InvalidPassword_ThrowsException() {
            UserLoginDTO dto = new UserLoginDTO("john_doe", "wrongpass");
            User user = new User();
            user.setUsername("john_doe");
            user.setPassword("encoded_secret");

            when(userRepository.findByUsername("john_doe")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("wrongpass", "encoded_secret")).thenReturn(false);

            assertThatThrownBy(() -> userService.login(dto))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appEx = (AppException) ex;
                        assertThat(appEx.getCode()).isEqualTo(ResponseCode.INVALID_CREDENTIALS);
                    });
        }

        @Test
        @DisplayName("Login succeeds and returns JWT token map")
        void login_Success() {
            UserLoginDTO dto = new UserLoginDTO("john_doe", "correctpass");
            User user = new User();
            user.setUsername("john_doe");
            user.setPassword("encoded_secret");
            user.setRole(Role.STUDENT);

            when(userRepository.findByUsername("john_doe")).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("correctpass", "encoded_secret")).thenReturn(true);
            when(jwtUtils.generateToken(eq("john_doe"), anyMap(), any())).thenReturn("mocked.jwt.token");

            Map<String, String> response = userService.login(dto);

            assertThat(response).containsEntry("token", "mocked.jwt.token");
        }
    }

    // ── AddUser Validation Failure Tests ────────────────────────────────────────

    @Nested
    @DisplayName("AddUser Validation Failure Tests")
    class AddUserValidationTests {

        private UserDTO createValidStudentDTO() {
            UserDTO dto = new UserDTO();
            dto.setUsername("valid_user");
            dto.setName("Valid Name");
            dto.setEmail("valid@example.com");
            dto.setPassword("password123");
            dto.setRole(Role.STUDENT);
            StudentDetails sd = new StudentDetails();
            sd.setRollNumber("20RCE001");
            sd.setDepartment("CSE");
            sd.setSection("A");
            sd.setAcademicYear("2024-2028");
            dto.setStudentDetails(sd);
            return dto;
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = { "ab", "aaaaaaaaaaaaaaaaaaaaa", "123user", "user@name", "user name" })
        @DisplayName("addUser throws ValidationException on invalid usernames")
        void addUser_InvalidUsername_ThrowsValidationException(String username) {
            UserDTO dto = createValidStudentDTO();
            dto.setUsername(username);

            assertThatThrownBy(() -> userService.addUser(dto))
                    .isInstanceOf(ValidationException.class);
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = { "a", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" })
        @DisplayName("addUser throws ValidationException on invalid names")
        void addUser_InvalidName_ThrowsValidationException(String name) {
            UserDTO dto = createValidStudentDTO();
            dto.setName(name);

            assertThatThrownBy(() -> userService.addUser(dto))
                    .isInstanceOf(ValidationException.class);
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = { "invalid-email", "user@", "@domain.com", "user@domain" })
        @DisplayName("addUser throws ValidationException on invalid emails")
        void addUser_InvalidEmail_ThrowsValidationException(String email) {
            UserDTO dto = createValidStudentDTO();
            dto.setEmail(email);

            assertThatThrownBy(() -> userService.addUser(dto))
                    .isInstanceOf(ValidationException.class);
        }

        @ParameterizedTest
        @NullAndEmptySource
        @ValueSource(strings = { "12345" })
        @DisplayName("addUser throws ValidationException on invalid password (< 6 chars)")
        void addUser_InvalidPassword_ThrowsValidationException(String password) {
            UserDTO dto = createValidStudentDTO();
            dto.setPassword(password);

            assertThatThrownBy(() -> userService.addUser(dto))
                    .isInstanceOf(ValidationException.class);
        }

        @Test
        @DisplayName("addUser throws ValidationException when role is missing")
        void addUser_MissingRole_ThrowsValidationException() {
            UserDTO dto = createValidStudentDTO();
            dto.setRole(null);

            assertThatThrownBy(() -> userService.addUser(dto))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Role is required");
        }

        @Test
        @DisplayName("addUser throws ValidationException when StudentDetails is null")
        void addUser_StudentMissingDetails_ThrowsValidationException() {
            UserDTO dto = createValidStudentDTO();
            dto.setStudentDetails(null);

            assertThatThrownBy(() -> userService.addUser(dto))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Roll number is required");
        }

        @Test
        @DisplayName("addUser throws ValidationException when MentorDetails is null")
        void addUser_MentorMissingDetails_ThrowsValidationException() {
            UserDTO dto = createValidStudentDTO();
            dto.setRole(Role.MENTOR);
            dto.setMentorDetails(null);

            assertThatThrownBy(() -> userService.addUser(dto))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Employee ID is required");
        }

        @Test
        @DisplayName("addUser throws ValidationException when Student has no department")
        void addUser_StudentMissingDepartment_ThrowsValidationException() {
            UserDTO dto = createValidStudentDTO();
            dto.getStudentDetails().setDepartment(null);

            assertThatThrownBy(() -> userService.addUser(dto))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Department is required for STUDENT");
        }

        @Test
        @DisplayName("addUser throws ValidationException when Student has no section")
        void addUser_StudentMissingSection_ThrowsValidationException() {
            UserDTO dto = createValidStudentDTO();
            dto.getStudentDetails().setSection(null);

            assertThatThrownBy(() -> userService.addUser(dto))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Section is required");
        }

        @ParameterizedTest
        @ValueSource(strings = { "2024", "2024-28", "abcd-efgh", "2024/2028" })
        @DisplayName("addUser throws ValidationException when academic year format is invalid")
        void addUser_StudentInvalidAcademicYear_ThrowsValidationException(String academicYear) {
            UserDTO dto = createValidStudentDTO();
            dto.getStudentDetails().setAcademicYear(academicYear);

            assertThatThrownBy(() -> userService.addUser(dto))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Academic year must be in format YYYY-YYYY");
        }

        @Test
        @DisplayName("addUser throws ValidationException when Mentor has no department")
        void addUser_MentorMissingDepartment_ThrowsValidationException() {
            UserDTO dto = createValidStudentDTO();
            dto.setRole(Role.MENTOR);
            MentorDetails md = new MentorDetails();
            md.setEmployeeID("EMP1001");
            md.setDepartment(null);
            dto.setMentorDetails(md);

            assertThatThrownBy(() -> userService.addUser(dto))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Department is required for MENTOR");
        }
    }

    // ── AddUser Conflict Tests ──────────────────────────────────────────────────

    @Nested
    @DisplayName("AddUser Conflict Tests")
    class AddUserConflictTests {

        private UserDTO createBaseDTO() {
            UserDTO dto = new UserDTO();
            dto.setUsername("test_user");
            dto.setName("Test Name");
            dto.setEmail("test@example.com");
            dto.setPassword("password123");
            dto.setRole(Role.STUDENT);
            StudentDetails sd = new StudentDetails();
            sd.setRollNumber("20RCE001");
            sd.setDepartment("CSE");
            sd.setSection("A");
            dto.setStudentDetails(sd);
            return dto;
        }

        @Test
        @DisplayName("addUser throws ConflictException when username already exists")
        void addUser_ConflictUsername_ThrowsConflictException() {
            UserDTO dto = createBaseDTO();
            User conflicting = new User();
            conflicting.setUsername(dto.getUsername());
            conflicting.setEmail("other@example.com");

            when(userRepository.findConflictingUsers(eq(dto), isNull())).thenReturn(List.of(conflicting));

            assertThatThrownBy(() -> userService.addUser(dto))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Username already exists");
        }

        @Test
        @DisplayName("addUser throws ConflictException when email already exists")
        void addUser_ConflictEmail_ThrowsConflictException() {
            UserDTO dto = createBaseDTO();
            User conflicting = new User();
            conflicting.setUsername("other_user");
            conflicting.setEmail(dto.getEmail());

            when(userRepository.findConflictingUsers(eq(dto), isNull())).thenReturn(List.of(conflicting));

            assertThatThrownBy(() -> userService.addUser(dto))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Email already exists");
        }

        @Test
        @DisplayName("addUser throws ConflictException when student roll number already exists")
        void addUser_ConflictRollNumber_ThrowsConflictException() {
            UserDTO dto = createBaseDTO();
            User conflicting = new User();
            conflicting.setUsername("other_user");
            conflicting.setEmail("other@example.com");
            StudentDetails sd = new StudentDetails();
            sd.setRollNumber(dto.getStudentDetails().getRollNumber());
            conflicting.setStudentDetails(sd);

            when(userRepository.findConflictingUsers(eq(dto), isNull())).thenReturn(List.of(conflicting));

            assertThatThrownBy(() -> userService.addUser(dto))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Roll number already exists");
        }

        @Test
        @DisplayName("addUser throws ConflictException when mentor employee ID already exists")
        void addUser_ConflictEmployeeId_ThrowsConflictException() {
            UserDTO dto = createBaseDTO();
            dto.setRole(Role.MENTOR);
            dto.setStudentDetails(null);
            MentorDetails md = new MentorDetails();
            md.setEmployeeID("EMP1001");
            md.setDepartment("CSE");
            dto.setMentorDetails(md);

            User conflicting = new User();
            conflicting.setUsername("other_mentor");
            conflicting.setEmail("other@example.com");
            MentorDetails conflictingMd = new MentorDetails();
            conflictingMd.setEmployeeID("EMP1001");
            conflicting.setMentorDetails(conflictingMd);

            when(userRepository.findConflictingUsers(eq(dto), isNull())).thenReturn(List.of(conflicting));

            assertThatThrownBy(() -> userService.addUser(dto))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Employee ID already exists");
        }

        @Test
        @DisplayName("addUser succeeds when all validations pass and no conflicts exist")
        void addUser_Success() {
            UserDTO dto = createBaseDTO();
            when(userRepository.findConflictingUsers(eq(dto), isNull())).thenReturn(List.of());
            when(sequenceGenerator.incrementSequence(User.sequenceName)).thenReturn(101L);
            when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

            User created = userService.addUser(dto);

            assertThat(created.getId()).isEqualTo(101L);
            assertThat(created.getPassword()).isEqualTo("encodedPassword");
            assertThat(created.isBanned()).isFalse();
        }
    }

    // ── UpdateUser Failure Tests ────────────────────────────────────────────────

    @Nested
    @DisplayName("UpdateUser Failure Tests")
    class UpdateUserTests {

        @Test
        @DisplayName("updateUser throws ValidationException when ID is null")
        void updateUser_NullId_ThrowsValidationException() {
            UserDTO dto = new UserDTO();
            dto.setId(null);

            assertThatThrownBy(() -> userService.updateUser(dto))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("User ID is required");
        }

        @Test
        @DisplayName("updateUser throws NotFoundException when user does not exist")
        void updateUser_NotFound_ThrowsNotFoundException() {
            UserDTO dto = new UserDTO();
            dto.setId(999L);
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.updateUser(dto))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("updateUser throws ValidationException when student changes role after raising complaints")
        void updateUser_RoleChangeWithComplaints_ThrowsValidationException() {
            User existing = new User();
            existing.setId(10L);
            existing.setRole(Role.STUDENT);
            StudentDetails sd = new StudentDetails();
            sd.setRollNumber("20RCE001");
            existing.setStudentDetails(sd);

            UserDTO dto = new UserDTO();
            dto.setId(10L);
            dto.setRole(Role.MENTOR);

            when(userRepository.findById(10L)).thenReturn(Optional.of(existing));
            when(complaintRepository.existsByRaisedBy("20RCE001")).thenReturn(true);

            assertThatThrownBy(() -> userService.updateUser(dto))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Cannot change role because this student has already raised complaints");
        }

        @Test
        @DisplayName("updateUser throws ValidationException when student modifies rollNumber after raising complaints")
        void updateUser_RollNumberChangeWithComplaints_ThrowsValidationException() {
            User existing = new User();
            existing.setId(10L);
            existing.setRole(Role.STUDENT);
            StudentDetails sd = new StudentDetails();
            sd.setRollNumber("20RCE001");
            sd.setDepartment("CSE");
            sd.setSection("A");
            existing.setStudentDetails(sd);

            UserDTO dto = new UserDTO();
            dto.setId(10L);
            StudentDetails newSd = new StudentDetails();
            newSd.setRollNumber("20RCE999");
            newSd.setDepartment("CSE");
            newSd.setSection("A");
            dto.setStudentDetails(newSd);

            when(userRepository.findById(10L)).thenReturn(Optional.of(existing));
            when(complaintRepository.existsByRaisedBy("20RCE001")).thenReturn(true);

            assertThatThrownBy(() -> userService.updateUser(dto))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining(
                            "Cannot modify department, section, or roll number after complaints are raised");
        }
    }

    // ── DeleteUser Failure Tests ────────────────────────────────────────────────

    @Nested
    @DisplayName("DeleteUser Failure Tests")
    class DeleteUserTests {

        @Test
        @DisplayName("deleteUser throws NotFoundException when user does not exist")
        void deleteUser_NotFound_ThrowsNotFoundException() {
            when(userRepository.existsById(999L)).thenReturn(false);

            assertThatThrownBy(() -> userService.deleteUser(999L))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("deleteUser succeeds when user exists")
        void deleteUser_Success() {
            when(userRepository.existsById(1L)).thenReturn(true);

            userService.deleteUser(1L);

            verify(userRepository).deleteById(1L);
        }
    }

    // ── Mentor Assignment Failure Tests ─────────────────────────────────────────

    @Nested
    @DisplayName("Mentor Assignment Failure Tests")
    class MentorAssignmentTests {

        @Test
        @DisplayName("assignMentorTo throws NotFoundException when mentor username does not exist")
        void assignMentorTo_NotFound_ThrowsNotFoundException() {
            when(userRepository.findByUsernameAndRole("nonexistent", Role.MENTOR)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.assignMentorTo("nonexistent", "CSE", "A"))
                    .isInstanceOf(NotFoundException.class);
        }

        @ParameterizedTest
        @NullAndEmptySource
        @DisplayName("assignMentorTo throws ValidationException when department is missing")
        void assignMentorTo_MissingDepartment_ThrowsValidationException(String dept) {
            User mentor = new User();
            mentor.setUsername("mentor1");
            when(userRepository.findByUsernameAndRole("mentor1", Role.MENTOR)).thenReturn(Optional.of(mentor));

            assertThatThrownBy(() -> userService.assignMentorTo("mentor1", dept, "A"))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Department is required");
        }

        @ParameterizedTest
        @NullAndEmptySource
        @DisplayName("assignMentorTo throws ValidationException when section is missing")
        void assignMentorTo_MissingSection_ThrowsValidationException(String section) {
            User mentor = new User();
            mentor.setUsername("mentor1");
            when(userRepository.findByUsernameAndRole("mentor1", Role.MENTOR)).thenReturn(Optional.of(mentor));

            assertThatThrownBy(() -> userService.assignMentorTo("mentor1", "CSE", section))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Section is required");
        }

        @Test
        @DisplayName("assignMentorTo throws ConflictException when section already assigned")
        void assignMentorTo_AlreadyAssigned_ThrowsConflictException() {
            User mentor = new User();
            mentor.setUsername("mentor1");
            MentorDetails md = new MentorDetails();
            md.setAssignedDepartments(new ArrayList<>(List.of(
                    new AssignedDepartmentDetails("CSE", new ArrayList<>(List.of("A"))))));
            mentor.setMentorDetails(md);

            when(userRepository.findByUsernameAndRole("mentor1", Role.MENTOR)).thenReturn(Optional.of(mentor));

            assertThatThrownBy(() -> userService.assignMentorTo("mentor1", "CSE", "A"))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Mentor is already assigned to this department and section");
        }

        @Test
        @DisplayName("deleteMentorAssignment throws ValidationException when department is not assigned")
        void deleteMentorAssignment_DeptNotAssigned_ThrowsValidationException() {
            User mentor = new User();
            mentor.setUsername("mentor1");
            MentorDetails md = new MentorDetails();
            md.setAssignedDepartments(new ArrayList<>(List.of(
                    new AssignedDepartmentDetails("ECE", new ArrayList<>(List.of("A"))))));
            mentor.setMentorDetails(md);

            when(userRepository.findByUsernameAndRole("mentor1", Role.MENTOR)).thenReturn(Optional.of(mentor));

            assertThatThrownBy(() -> userService.deleteMentorAssignment("mentor1", "CSE", "A"))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Mentor is not assigned to this department");
        }

        @Test
        @DisplayName("deleteMentorAssignment throws ValidationException when section is not assigned")
        void deleteMentorAssignment_SectionNotAssigned_ThrowsValidationException() {
            User mentor = new User();
            mentor.setUsername("mentor1");
            MentorDetails md = new MentorDetails();
            md.setAssignedDepartments(new ArrayList<>(List.of(
                    new AssignedDepartmentDetails("CSE", new ArrayList<>(List.of("B"))))));
            mentor.setMentorDetails(md);

            when(userRepository.findByUsernameAndRole("mentor1", Role.MENTOR)).thenReturn(Optional.of(mentor));

            assertThatThrownBy(() -> userService.deleteMentorAssignment("mentor1", "CSE", "A"))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Mentor is not assigned to this section in the department");
        }

        @Test
        @DisplayName("getMentorDepartments throws ValidationException when user is not a mentor")
        void getMentorDepartments_NotMentor_ThrowsValidationException() {
            User user = new User();
            user.setUsername("student1");
            user.setMentorDetails(null);

            when(userRepository.findByUsername("student1")).thenReturn(Optional.of(user));

            assertThatThrownBy(() -> userService.getMentorDepartments("student1"))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("User is not a mentor");
        }
    }
}
