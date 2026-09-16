package com.rce.complaint_box.model;

import java.util.ArrayList;
import java.util.Date;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.IndexDirection;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.rce.complaint_box.model.enums.Role;
import com.rce.complaint_box.dto.UserDTO;
import com.rce.complaint_box.model.enums.Gender;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Document(collection = "users")
public class User {

    @Transient
    public static final String sequenceName = "users_sequence";

    @Id
    @Indexed(direction = IndexDirection.DESCENDING)
    private Long id;

    @Indexed(unique = true)
    private String username;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    @Indexed
    private Role role;

    private Gender gender;

    private String mobile;

    private Date dob;

    private String profilePic;

    private boolean banned = false;

    private StudentDetails studentDetails;
    private MentorDetails mentorDetails;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public User(UserDTO dto) {
        this.username = dto.getUsername();
        this.name = dto.getName();
        this.email = dto.getEmail();
        this.password = dto.getPassword();
        this.role = dto.getRole();
        this.gender = dto.getGender();
        this.mobile = dto.getMobile();
        this.profilePic = dto.getProfilePic();
        this.dob = dto.getDob();
        this.banned = dto.isBanned();

        applyRoleDetails(dto.getRole(), dto.getStudentDetails(), dto.getMentorDetails());

        this.complaintDetails = dto.getComplaintDetails() != null
                ? dto.getComplaintDetails()
                : new ComplaintDetails(0, 0, 0, 0, 0, 0, new ArrayList<>());
    }

    private void applyRoleDetails(Role role,
                                  StudentDetails student,
                                  MentorDetails mentor) {

        if (role == Role.STUDENT) {
            this.studentDetails = student;
            this.mentorDetails = null;
        } else if (role == Role.MENTOR) {
            this.mentorDetails = mentor;
            this.studentDetails = null;
        } else {
            this.studentDetails = null;
            this.mentorDetails = null;
        }
    }

    public void override(User newUser) {
        if (newUser.getUsername() != null)
            this.setUsername(newUser.getUsername());
        if (newUser.getName() != null)
            this.setName(newUser.getName());
        if (newUser.getEmail() != null)
            this.setEmail(newUser.getEmail());
        if (newUser.getPassword() != null)
            this.setPassword(newUser.getPassword());
        if (newUser.getRole() != null)
            this.setRole(newUser.getRole());
        if (newUser.getGender() != null)
            this.setGender(newUser.getGender());
        if (newUser.getMobile() != null)
            this.setMobile(newUser.getMobile());
        if (newUser.getDob() != null)
            this.setDob(newUser.getDob());
        if (newUser.getProfilePic() != null)
            this.setProfilePic(newUser.getProfilePic());

        Role effectiveRole = (newUser.getRole() != null) ? newUser.getRole() : this.getRole();

        if (effectiveRole == Role.STUDENT) {
            if (newUser.getStudentDetails() != null) {
                this.setStudentDetails(newUser.getStudentDetails());
            }
            this.setMentorDetails(null);
        } else if (effectiveRole == Role.MENTOR) {
            if (newUser.getMentorDetails() != null) {
                this.setMentorDetails(newUser.getMentorDetails());
            }
            this.setStudentDetails(null);
        } else {
            this.setStudentDetails(null);
            this.setMentorDetails(null);
        }

        this.setBanned(newUser.isBanned());
    }

    public void override(UserDTO newUser) {
        if (newUser.getUsername() != null && !newUser.getUsername().isBlank())
            this.setUsername(newUser.getUsername());
        if (newUser.getName() != null && !newUser.getName().isBlank())
            this.setName(newUser.getName());
        if (newUser.getEmail() != null && !newUser.getEmail().isBlank())
            this.setEmail(newUser.getEmail());
        if (newUser.getPassword() != null && !newUser.getPassword().isBlank())
            this.setPassword(newUser.getPassword());
        if (newUser.getRole() != null)
            this.setRole(newUser.getRole());
        if (newUser.getGender() != null)
            this.setGender(newUser.getGender());
        if (newUser.getMobile() != null && !newUser.getMobile().isBlank())
            this.setMobile(newUser.getMobile());
        if (newUser.getDob() != null)
            this.setDob(newUser.getDob());
        if (newUser.getProfilePic() != null && !newUser.getProfilePic().isBlank())
            this.setProfilePic(newUser.getProfilePic());

        Role effectiveRole = (newUser.getRole() != null) ? newUser.getRole() : this.getRole();

        if (effectiveRole == Role.STUDENT) {
            if (newUser.getStudentDetails() != null) {
                this.setStudentDetails(newUser.getStudentDetails());
            }
            this.setMentorDetails(null);
        } else if (effectiveRole == Role.MENTOR) {
            if (newUser.getMentorDetails() != null) {
                this.setMentorDetails(newUser.getMentorDetails());
            }
            this.setStudentDetails(null);
        } else {
            this.setStudentDetails(null);
            this.setMentorDetails(null);
        }

        this.setBanned(newUser.isBanned());
    };

    private ComplaintDetails complaintDetails = new ComplaintDetails(0, 0, 0, 0, 0, 0, new ArrayList<>());

}
