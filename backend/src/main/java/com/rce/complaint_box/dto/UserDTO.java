package com.rce.complaint_box.dto;

import java.util.Date;

import com.rce.complaint_box.model.ComplaintDetails;
import com.rce.complaint_box.model.MentorDetails;
import com.rce.complaint_box.model.StudentDetails;
import com.rce.complaint_box.model.User;
import com.rce.complaint_box.model.enums.Gender;
import com.rce.complaint_box.model.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserDTO {

    private Long id;
    private String username;
    private String name;
    private String email;
    private String password;
    private Role role;
    private Gender gender;
    private String mobile;
    private String profilePic;
    private Date dob;
    private boolean banned;

    private StudentDetails studentDetails;
    private MentorDetails mentorDetails;
    private ComplaintDetails complaintDetails;

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.gender = user.getGender();
        this.mobile = user.getMobile();
        this.profilePic = user.getProfilePic();
        this.dob = user.getDob();
        this.banned = user.isBanned();
        this.studentDetails = user.getStudentDetails();
        this.mentorDetails = user.getMentorDetails();
        this.complaintDetails = user.getComplaintDetails();
    }
}
