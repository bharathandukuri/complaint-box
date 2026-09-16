package com.rce.complaint_box.controller;

import java.util.List;
import java.util.Map;

import com.rce.complaint_box.model.AssignedDepartmentDetails;
import com.rce.complaint_box.model.ApiResponse;
import com.rce.complaint_box.security.model.AppUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.rce.complaint_box.dto.UserDTO;
import com.rce.complaint_box.dto.UserLoginDTO;
import com.rce.complaint_box.dto.UserQuery;
import com.rce.complaint_box.model.User;
import com.rce.complaint_box.model.enums.ResponseCode;
import com.rce.complaint_box.service.UserService;
import com.rce.complaint_box.utils.ResponseFactory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getUser(@AuthenticationPrincipal AppUserDetails userDetails) {
        User user = userDetails.getUser();
        return ResponseFactory.success("User retrieved successfully", user);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> login(@Valid @RequestBody UserLoginDTO userLoginDTO) {
        Map<String, String> token = userService.login(userLoginDTO);
        return ResponseFactory.success(ResponseCode.LOGIN_SUCCESS, "Login successful", token);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getUsers(
            @RequestParam(required = false) Long lastID,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "") String searchKey,
            @RequestParam(defaultValue = "NAME") String searchProperty,
            @RequestParam(defaultValue = "ALL") String role,
            @RequestParam(defaultValue = "ALL") String department,
            @RequestParam(defaultValue = "ALL") String section,
            @RequestParam(defaultValue = "") String academicYear) {
        UserQuery query = new UserQuery();
        query.lastID = lastID;
        query.size = size;
        query.searchKey = searchKey;
        query.searchProperty = searchProperty;
        query.role = role;
        query.department = department;
        query.section = section;
        query.academicYear = academicYear;
        return userService.getUsers(query);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, User>>> addUser(@RequestBody UserDTO user) {
        User saved = userService.addUser(user);
        return ResponseFactory.success("User created successfully.", Map.of("user", saved));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, User>>> updateUser(@RequestBody UserDTO user) {
        User saved = userService.updateUser(user);
        return ResponseFactory.success("User updated successfully.", Map.of("user", saved));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@RequestParam Long id) {
        userService.deleteUser(id);
        return ResponseFactory.success(ResponseCode.USER_DELETED, "User has been deleted.");
    }

    @PostMapping("/mentor/assign/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> assignMentorToDepartment(
            @PathVariable String username,
            @RequestParam String department,
            @RequestParam String section) {
        UserDTO result = userService.assignMentorTo(username, department, section);
        return ResponseFactory.success("Mentor assigned to department and section successfully.", result);
    }

    @DeleteMapping("/mentor/assign/{username}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDTO>> deleteMentorAssignment(
            @PathVariable String username,
            @RequestParam String department,
            @RequestParam String section) {
        UserDTO result = userService.deleteMentorAssignment(username, department, section);
        return ResponseFactory.success("Mentor assignment removed successfully.", result);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/mentor/departments/{username}")
    public ResponseEntity<ApiResponse<List<AssignedDepartmentDetails>>> getMentorDepartments(
            @PathVariable String username) {
        List<AssignedDepartmentDetails> depts = userService.getMentorDepartments(username);
        return ResponseFactory.success("Mentor departments retrieved successfully.", depts);
    }
}
