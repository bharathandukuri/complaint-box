package com.rce.complaint_box.config;

import com.rce.complaint_box.model.*;
import com.rce.complaint_box.model.enums.Gender;
import com.rce.complaint_box.model.enums.Role;
import com.rce.complaint_box.repository.ComplaintTypeRepository;
import com.rce.complaint_box.repository.DepartmentRepository;
import com.rce.complaint_box.repository.user.UserRepository;
import com.rce.complaint_box.service.SequenceGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintTypeRepository complaintTypeRepository;
    private final SequenceGenerator sequenceGenerator;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedDepartments();
        seedUsers();
        seedComplaintTypes();
    }

    private void seedDepartments() {
        if (departmentRepository.count() > 0) {
            return;
        }

        log.info("Seeding initial departments...");
        departmentRepository.saveAll(List.of(
                new Department("CSE", "Computer Science & Engineering",
                        List.of(new Section("A"), new Section("B"), new Section("C"))),
                new Department("ECE", "Electronics & Communication Engineering",
                        List.of(new Section("A"), new Section("B"))),
                new Department("MECH", "Mechanical Engineering",
                        List.of(new Section("A"))),
                new Department("CIVIL", "Civil Engineering",
                        List.of(new Section("A")))
        ));
        log.info("Departments seeded successfully.");
    }

    private void seedUsers() {
        if (userRepository.count() > 0) {
            return;
        }

        log.info("Seeding initial users (admin, mentor, student)...");

        // 1. Admin
        User admin = new User();
        admin.setId(1L);
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setName("System Administrator");
        admin.setEmail("admin@rce.ac.in");
        admin.setRole(Role.ADMIN);
        admin.setGender(Gender.MALE);
        admin.setBanned(false);
        admin.setCreatedAt(new Date());

        // 2. Mentor
        User mentor = new User();
        mentor.setId(2L);
        mentor.setUsername("mentor_cse");
        mentor.setPassword(passwordEncoder.encode("mentor123"));
        mentor.setName("Dr. Rajesh Kumar");
        mentor.setEmail("mentor.cse@rce.ac.in");
        mentor.setRole(Role.MENTOR);
        mentor.setGender(Gender.MALE);
        mentor.setBanned(false);
        mentor.setCreatedAt(new Date());

        MentorDetails mentorDetails = new MentorDetails();
        mentorDetails.setEmployeeID("EMP101");
        mentorDetails.setDepartment("CSE");
        mentorDetails.setAssignedDepartments(new ArrayList<>(List.of(
                new AssignedDepartmentDetails("CSE", new ArrayList<>(List.of("A", "B")))
        )));
        mentor.setMentorDetails(mentorDetails);

        // 3. Student
        User student = new User();
        student.setId(3L);
        student.setUsername("student_20rce001");
        student.setPassword(passwordEncoder.encode("student123"));
        student.setName("Arun Varma");
        student.setEmail("student001@rce.ac.in");
        student.setRole(Role.STUDENT);
        student.setGender(Gender.MALE);
        student.setBanned(false);
        student.setCreatedAt(new Date());

        StudentDetails studentDetails = new StudentDetails();
        studentDetails.setRollNumber("20RCE001");
        studentDetails.setDepartment("CSE");
        studentDetails.setSection("A");
        studentDetails.setAcademicYear("2024-2028");
        student.setStudentDetails(studentDetails);

        userRepository.saveAll(List.of(admin, mentor, student));
        sequenceGenerator.setSequence(User.sequenceName, 3);
        log.info("Users seeded successfully.");
    }

    private void seedComplaintTypes() {
        // Dynamic Form 1: Hostel Maintenance
        String hostelFormJson = """
                [
                  {
                    "id": "f_block",
                    "elementType": "field",
                    "fieldType": "select-field",
                    "name": "block",
                    "label": "Hostel Block",
                    "placeholder": "Select your block",
                    "required": true,
                    "options": [
                      {"label": "A-Block (Boys)", "value": "A_BLOCK"},
                      {"label": "B-Block (Boys)", "value": "B_BLOCK"},
                      {"label": "C-Block (Boys)", "value": "C_BLOCK"},
                      {"label": "Girls Hostel Block 1", "value": "GIRLS_1"}
                    ]
                  },
                  {
                    "id": "f_room",
                    "elementType": "field",
                    "fieldType": "text-field",
                    "type": "text",
                    "name": "roomNumber",
                    "label": "Room Number",
                    "placeholder": "e.g. 204",
                    "required": true
                  },
                  {
                    "id": "f_category",
                    "elementType": "field",
                    "fieldType": "radio-field",
                    "name": "category",
                    "label": "Issue Category",
                    "layout": "row",
                    "defaultValue": "ELECTRICAL",
                    "required": true,
                    "options": [
                      {"label": "Electrical", "value": "ELECTRICAL"},
                      {"label": "Plumbing", "value": "PLUMBING"},
                      {"label": "Carpentry", "value": "CARPENTRY"},
                      {"label": "Cleanliness", "value": "CLEANLINESS"}
                    ]
                  },
                  {
                    "id": "f_desc",
                    "elementType": "field",
                    "fieldType": "text-area",
                    "name": "issueDetails",
                    "label": "Specific Issue Details",
                    "placeholder": "Please describe the maintenance issue in detail...",
                    "required": true
                  },
                  {
                    "id": "f_photo",
                    "elementType": "field",
                    "fieldType": "file-input-field",
                    "name": "photoAttachment",
                    "label": "Photo / Evidence (optional)",
                    "placeholder": "Upload photo or evidence",
                    "accept": "image",
                    "multiple": false,
                    "required": false
                  }
                ]
                """.trim();

        // Dynamic Form 2: Academic & Laboratory Issue
        String academicFormJson = """
                [
                  {
                    "id": "f_course",
                    "elementType": "field",
                    "fieldType": "text-field",
                    "type": "text",
                    "name": "courseCode",
                    "label": "Course / Subject Code",
                    "placeholder": "e.g. CS301 - Operating Systems",
                    "required": true
                  },
                  {
                    "id": "f_lab",
                    "elementType": "field",
                    "fieldType": "text-field",
                    "type": "text",
                    "name": "labRoom",
                    "label": "Lab Room / Equipment ID",
                    "placeholder": "e.g. System No. 42 / Lab 3",
                    "required": false
                  },
                  {
                    "id": "f_remarks",
                    "elementType": "field",
                    "fieldType": "text-area",
                    "name": "remarks",
                    "label": "Grievance Remarks",
                    "placeholder": "Explain the academic or lab issue...",
                    "required": true
                  }
                ]
                """.trim();

        // Dynamic Form 3: Campus Facilities
        String campusFormJson = """
                [
                  {
                    "id": "f_location",
                    "elementType": "field",
                    "fieldType": "text-field",
                    "type": "text",
                    "name": "location",
                    "label": "Campus Location / Building",
                    "placeholder": "e.g. Central Library 2nd Floor",
                    "required": true
                  },
                  {
                    "id": "f_facility",
                    "elementType": "field",
                    "fieldType": "select-field",
                    "name": "facilityType",
                    "label": "Facility Type",
                    "placeholder": "Select facility",
                    "required": true,
                    "options": [
                      {"label": "Library", "value": "LIBRARY"},
                      {"label": "Canteen / Mess", "value": "CANTEEN"},
                      {"label": "Sports Complex", "value": "SPORTS"},
                      {"label": "Wi-Fi & Network", "value": "WIFI"},
                      {"label": "Restrooms", "value": "RESTROOMS"}
                    ]
                  },
                  {
                    "id": "f_details",
                    "elementType": "field",
                    "fieldType": "text-area",
                    "name": "details",
                    "label": "Description of the Problem",
                    "placeholder": "Describe what needs repair or attention...",
                    "required": true
                  }
                ]
                """.trim();

        if (complaintTypeRepository.count() == 0) {
            log.info("Seeding initial dynamic complaint types (forms)...");
            ComplaintType hostel = new ComplaintType(1L, "Hostel Maintenance",
                    "Hostel electrical, plumbing, sanitation, and room repair complaints", hostelFormJson, new Date(), new Date());

            ComplaintType academic = new ComplaintType(2L, "Academic & Lab Issues",
                    "Curriculum, lecture halls, computer laboratories, and experimental apparatus issues", academicFormJson, new Date(), new Date());

            ComplaintType campus = new ComplaintType(3L, "Campus Facilities & Infrastructure",
                    "General campus amenities including library, Wi-Fi, canteen, and sports facilities", campusFormJson, new Date(), new Date());

            complaintTypeRepository.saveAll(List.of(hostel, academic, campus));
            sequenceGenerator.setSequence(ComplaintType.sequenceName, 3);
            log.info("Dynamic complaint types (forms) seeded successfully.");
        } else {
            // Self-healing migration for existing database seed data
            ComplaintType existingHostel = complaintTypeRepository.findByTitle("Hostel Maintenance");
            if (existingHostel != null && existingHostel.getFields() != null &&
                    (existingHostel.getFields().contains("\"file-field\"") || existingHostel.getFields().contains("\"name\": \"description\""))) {
                existingHostel.setFields(hostelFormJson);
                existingHostel.setUpdatedAt(new Date());
                complaintTypeRepository.save(existingHostel);
                log.info("Migrated existing Hostel Maintenance schema to corrected JSON definition.");
            }
        }
    }
}