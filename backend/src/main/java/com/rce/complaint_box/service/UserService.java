package com.rce.complaint_box.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.rce.complaint_box.exception.AppException;
import com.rce.complaint_box.exception.ConflictException;
import com.rce.complaint_box.exception.NotFoundException;
import com.rce.complaint_box.exception.ValidationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rce.complaint_box.dto.UserDTO;
import com.rce.complaint_box.dto.UserLoginDTO;
import com.rce.complaint_box.dto.UserQuery;
import com.rce.complaint_box.model.AssignedDepartmentDetails;
import com.rce.complaint_box.model.User;
import com.rce.complaint_box.model.enums.ResponseCode;
import com.rce.complaint_box.model.enums.Role;
import com.rce.complaint_box.repository.complaint.ComplaintRepository;
import com.rce.complaint_box.repository.user.UserRepository;
import com.rce.complaint_box.security.jwt.JwtUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final SequenceGenerator sequenceGenerator;
    private final ComplaintRepository complaintRepository;

    @Value("${jwt-expiry}")
    private Long jwtExpiry;

    public Map<String, String> login(UserLoginDTO dto) {
        var user = userRepository.findByUsername(dto.getUsername())
                .orElseThrow(() -> new AppException(ResponseCode.USER_NOT_FOUND, HttpStatus.UNAUTHORIZED,
                        "There is no user exists with this username."));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new AppException(ResponseCode.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED,
                    "Invalid username or password.");
        }

        String token = jwtUtils.generateToken(user.getUsername(), Map.of("role", user.getRole()),
                new Date(System.currentTimeMillis() + jwtExpiry));
        return Map.of("token", token);
    }

    public List<User> getUsers(UserQuery queryDto) {
        return userRepository.getUsersByUserQuery(queryDto);
    }

    public User addUser(UserDTO dto) {
        validateUsername(dto.getUsername());
        validateName(dto.getName());
        validateEmail(dto.getEmail());
        validatePassword(dto.getPassword());

        if (dto.getRole() == null) {
            throw new ValidationException("Role is required");
        }
        if (dto.getRole() == Role.STUDENT
                && (dto.getStudentDetails() == null || dto.getStudentDetails().getRollNumber() == null)) {
            throw new ValidationException("Roll number is required for role STUDENT");
        }
        if (dto.getRole() == Role.MENTOR
                && (dto.getMentorDetails() == null || dto.getMentorDetails().getEmployeeID() == null)) {
            throw new ValidationException("Employee ID is required for role MENTOR");
        }

        if (dto.getRole() == Role.STUDENT) {
            if (dto.getStudentDetails() == null || dto.getStudentDetails().getDepartment() == null) {
                throw new ValidationException("Department is required for STUDENT");
            }
            if (dto.getStudentDetails().getSection() == null) {
                throw new ValidationException("Section is required when department is given");
            }
            if (dto.getStudentDetails().getAcademicYear() != null
                    && !dto.getStudentDetails().getAcademicYear().matches("^\\d{4}-\\d{4}$")) {
                throw new ValidationException("Academic year must be in format YYYY-YYYY");
            }
        }

        if (dto.getRole() == Role.MENTOR) {
            if (dto.getMentorDetails() == null || dto.getMentorDetails().getDepartment() == null) {
                throw new ValidationException("Department is required for MENTOR");
            }
        }

        List<User> conflicts = userRepository.findConflictingUsers(dto, null);
        checkConflicts(conflicts, dto);

        User newUser = new User(dto);
        newUser.setId(sequenceGenerator.incrementSequence(User.sequenceName));
        newUser.setBanned(false);
        newUser.setStudentDetails(newUser.getRole() == Role.STUDENT ? newUser.getStudentDetails() : null);
        newUser.setMentorDetails(newUser.getRole() == Role.MENTOR ? newUser.getMentorDetails() : null);
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));

        return userRepository.save(newUser);
    }

    public User updateUser(UserDTO dto) {
        if (dto.getId() == null) {
            throw new ValidationException("User ID is required.");
        }

        User existingUser = userRepository.findById(dto.getId())
                .orElseThrow(() -> new NotFoundException(ResponseCode.USER_NOT_FOUND, "User not found."));

        if (dto.getUsername() != null)
            validateUsername(dto.getUsername());
        if (dto.getName() != null)
            validateName(dto.getName());
        if (dto.getEmail() != null)
            validateEmail(dto.getEmail());
        if (dto.getPassword() != null && !dto.getPassword().isBlank())
            validatePassword(dto.getPassword());

        Role effectiveRole = (dto.getRole() != null) ? dto.getRole() : existingUser.getRole();
        if (effectiveRole == null) {
            throw new ValidationException("Role is required");
        }
        if (effectiveRole == Role.STUDENT
                && ((dto.getStudentDetails() != null && dto.getStudentDetails().getRollNumber() == null)
                        && (existingUser.getStudentDetails() == null
                                || existingUser.getStudentDetails().getRollNumber() == null))) {
            throw new ValidationException("Roll number is required for role STUDENT");
        }
        if (effectiveRole == Role.MENTOR
                && ((dto.getMentorDetails() != null && dto.getMentorDetails().getEmployeeID() == null)
                        && (existingUser.getMentorDetails() == null
                                || existingUser.getMentorDetails().getEmployeeID() == null))) {
            throw new ValidationException("Employee ID is required for role MENTOR");
        }

        if (effectiveRole == Role.STUDENT) {
            String dept = dto.getStudentDetails() != null ? dto.getStudentDetails().getDepartment()
                    : existingUser.getStudentDetails() != null ? existingUser.getStudentDetails().getDepartment()
                            : null;
            String section = dto.getStudentDetails() != null ? dto.getStudentDetails().getSection()
                    : existingUser.getStudentDetails() != null ? existingUser.getStudentDetails().getSection()
                            : null;
            if (dept == null) {
                throw new ValidationException("Department is required for STUDENT");
            }
            if (section == null) {
                throw new ValidationException("Section is required when department is given");
            }
            String academicYear = dto.getStudentDetails() != null ? dto.getStudentDetails().getAcademicYear()
                    : existingUser.getStudentDetails() != null ? existingUser.getStudentDetails().getAcademicYear()
                            : null;
            if (academicYear != null && !academicYear.matches("^\\d{4}-\\d{4}$")) {
                throw new ValidationException("Academic year must be in format YYYY-YYYY");
            }
        }

        List<User> conflicts = userRepository.findConflictingUsers(dto, existingUser.getId());
        checkUpdateConflicts(conflicts, dto, effectiveRole, existingUser);

        if (existingUser.getRole() == Role.STUDENT && existingUser.getStudentDetails() != null) {
            boolean hasComplaints = complaintRepository
                    .existsByRaisedBy(existingUser.getStudentDetails().getRollNumber());

            if (hasComplaints) {
                if (dto.getRole() != null && dto.getRole() != existingUser.getRole()) {
                    throw new ValidationException(
                            "Cannot change role because this student has already raised complaints.");
                }

                var existingStudent = existingUser.getStudentDetails();
                var newStudent = dto.getStudentDetails();

                if (newStudent != null) {
                    boolean deptChanged = newStudent.getDepartment() != null
                            && !newStudent.getDepartment().equals(existingStudent.getDepartment());
                    boolean sectionChanged = newStudent.getSection() != null
                            && !newStudent.getSection().equals(existingStudent.getSection());
                    boolean rollChanged = newStudent.getRollNumber() != null
                            && !newStudent.getRollNumber().equals(existingStudent.getRollNumber());

                    if (deptChanged || sectionChanged || rollChanged) {
                        throw new ValidationException(
                                "Cannot modify department, section, or roll number after complaints are raised.");
                    }
                }
            }
        }

        existingUser.override(dto);
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            existingUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return userRepository.save(existingUser);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new NotFoundException(ResponseCode.USER_NOT_FOUND, "User not found.");
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public UserDTO assignMentorTo(String username, String department, String section) {
        User mentor = userRepository.findByUsernameAndRole(username, Role.MENTOR)
                .orElseThrow(() -> new NotFoundException(ResponseCode.USER_NOT_FOUND, "Mentor not found."));

        if (department == null || department.isBlank()) {
            throw new ValidationException("Department is required.");
        }
        if (section == null || section.isBlank()) {
            throw new ValidationException("Section is required.");
        }

        var mentorDetails = mentor.getMentorDetails();
        var assignedDepts = mentorDetails.getAssignedDepartments();

        Optional<AssignedDepartmentDetails> deptOpt = assignedDepts.stream()
                .filter(d -> d.getCode().equalsIgnoreCase(department))
                .findFirst();

        if (deptOpt.isPresent()) {
            var sections = deptOpt.get().getSections();
            if (sections.stream().anyMatch(s -> s.equalsIgnoreCase(section))) {
                throw new ConflictException(ResponseCode.CONFLICT_MENTOR_ASSIGNMENT,
                        "Mentor is already assigned to this department and section.");
            }
            sections.add(section);
        } else {
            assignedDepts.add(new AssignedDepartmentDetails(department,
                    new ArrayList<>(List.of(section))));
        }

        mentorDetails.setAssignedDepartments(assignedDepts);
        mentor.setMentorDetails(mentorDetails);

        return new UserDTO(userRepository.save(mentor));
    }

    public UserDTO deleteMentorAssignment(String username, String department, String section) {
        User mentor = userRepository.findByUsernameAndRole(username, Role.MENTOR)
                .orElseThrow(() -> new NotFoundException(ResponseCode.USER_NOT_FOUND, "Mentor not found."));

        if (department == null || department.isBlank()) {
            throw new ValidationException("Department is required.");
        }
        if (section == null || section.isBlank()) {
            throw new ValidationException("Section is required.");
        }

        var mentorDetails = mentor.getMentorDetails();
        var assignedDepts = mentorDetails.getAssignedDepartments();

        AssignedDepartmentDetails dept = assignedDepts.stream()
                .filter(d -> d.getCode().equalsIgnoreCase(department))
                .findFirst()
                .orElseThrow(() -> new ValidationException("Mentor is not assigned to this department."));

        var sections = dept.getSections();
        String matchedSection = sections.stream()
                .filter(s -> s.equalsIgnoreCase(section))
                .findFirst()
                .orElseThrow(() -> new ValidationException(
                        "Mentor is not assigned to this section in the department."));

        sections.remove(matchedSection);
        if (sections.isEmpty()) {
            assignedDepts.remove(dept);
        }
        mentorDetails.setAssignedDepartments(assignedDepts);
        mentor.setMentorDetails(mentorDetails);

        return new UserDTO(userRepository.save(mentor));
    }

    public List<AssignedDepartmentDetails> getMentorDepartments(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException(ResponseCode.USER_NOT_FOUND, "User not found."));

        var mentor = user.getMentorDetails();
        if (mentor == null) {
            throw new ValidationException("User is not a mentor.");
        }

        return mentor.getAssignedDepartments();
    }

    // ── Private validation helpers ──

    private void validateUsername(String username) {
        if (username == null || username.isEmpty())
            throw new ValidationException("Username cannot be empty");
        if (username.length() < 3 || username.length() > 20)
            throw new ValidationException("Username must be between 3 and 20 characters");
        if (!username.matches("^[a-zA-Z][a-zA-Z0-9_]+$"))
            throw new ValidationException("Username can only contain letters, numbers, and underscores");
    }

    private void validateName(String name) {
        if (name == null || name.isEmpty())
            throw new ValidationException("Name cannot be empty");
        if (name.length() < 2 || name.length() > 50)
            throw new ValidationException("Name must be between 2 and 50 characters");
    }

    private void validateEmail(String email) {
        if (email == null || email.isEmpty())
            throw new ValidationException("Email cannot be empty");
        if (!email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"))
            throw new ValidationException("Invalid email format");
    }

    private void validatePassword(String password) {
        if (password == null || password.isEmpty())
            throw new ValidationException("Password cannot be empty");
        if (password.length() < 6)
            throw new ValidationException("Password must be at least 6 characters.");
    }

    private void checkConflicts(List<User> conflicts, UserDTO dto) {
        for (User existing : conflicts) {
            if (existing.getUsername().equals(dto.getUsername()))
                throw new ConflictException(ResponseCode.CONFLICT_USERNAME, "Username already exists");
            if (existing.getEmail().equals(dto.getEmail()))
                throw new ConflictException(ResponseCode.CONFLICT_EMAIL, "Email already exists");
            if (dto.getRole() == Role.STUDENT && existing.getStudentDetails() != null
                    && dto.getStudentDetails().getRollNumber()
                            .equals(existing.getStudentDetails().getRollNumber()))
                throw new ConflictException(ResponseCode.CONFLICT_ROLLNUMBER, "Roll number already exists");
            if (dto.getRole() == Role.MENTOR && existing.getMentorDetails() != null
                    && dto.getMentorDetails().getEmployeeID()
                            .equals(existing.getMentorDetails().getEmployeeID()))
                throw new ConflictException(ResponseCode.CONFLICT_EMPLOYEEID, "Employee ID already exists");
        }
    }

    private void checkUpdateConflicts(List<User> conflicts, UserDTO dto, Role effectiveRole, User existingUser) {
        for (User u : conflicts) {
            if (dto.getUsername() != null && u.getUsername().equals(dto.getUsername()))
                throw new ConflictException(ResponseCode.CONFLICT_USERNAME, "Username already exists");
            if (dto.getEmail() != null && u.getEmail().equals(dto.getEmail()))
                throw new ConflictException(ResponseCode.CONFLICT_EMAIL, "Email already exists");
            if (effectiveRole == Role.STUDENT && u.getStudentDetails() != null) {
                String checkRoll = dto.getStudentDetails() != null ? dto.getStudentDetails().getRollNumber()
                        : existingUser.getStudentDetails() != null
                                ? existingUser.getStudentDetails().getRollNumber()
                                : null;
                if (checkRoll != null && checkRoll.equals(u.getStudentDetails().getRollNumber()))
                    throw new ConflictException(ResponseCode.CONFLICT_ROLLNUMBER, "Roll number already exists");
            }
            if (effectiveRole == Role.MENTOR && u.getMentorDetails() != null) {
                String checkEmp = dto.getMentorDetails() != null ? dto.getMentorDetails().getEmployeeID()
                        : existingUser.getMentorDetails() != null
                                ? existingUser.getMentorDetails().getEmployeeID()
                                : null;
                if (checkEmp != null && checkEmp.equals(u.getMentorDetails().getEmployeeID()))
                    throw new ConflictException(ResponseCode.CONFLICT_EMPLOYEEID, "Employee ID already exists");
            }
        }
    }
}
