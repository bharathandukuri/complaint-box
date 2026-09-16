package com.rce.complaint_box.service;

import com.rce.complaint_box.exception.NotFoundException;
import com.rce.complaint_box.exception.UnauthorizedException;
import com.rce.complaint_box.model.Complaint;
import com.rce.complaint_box.model.ComplaintAction;
import com.rce.complaint_box.model.ComplaintDetails;
import com.rce.complaint_box.model.StudentDetails;
import com.rce.complaint_box.model.User;
import com.rce.complaint_box.model.enums.ComplaintStatus;
import com.rce.complaint_box.model.enums.Role;
import com.rce.complaint_box.repository.complaint.ComplaintRepository;
import com.rce.complaint_box.repository.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SequenceGenerator sequenceGenerator;

    @InjectMocks
    private ComplaintService complaintService;

    @Nested
    @DisplayName("Add Complaint Failure and Success Tests")
    class AddComplaintTests {

        @Test
        @DisplayName("addComplaint throws UnauthorizedException when user is not a student (studentDetails is null)")
        void addComplaint_NonStudent_ThrowsUnauthorizedException() {
            User nonStudent = new User();
            nonStudent.setRole(Role.ADMIN);
            nonStudent.setStudentDetails(null);

            Complaint complaint = new Complaint();

            assertThatThrownBy(() -> complaintService.addComplaint(complaint, nonStudent))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("Only students can raise complaints");
        }

        @Test
        @DisplayName("addComplaint succeeds and initializes student counters and recent complaints")
        void addComplaint_Success() {
            User student = new User();
            student.setId(1L);
            student.setRole(Role.STUDENT);
            StudentDetails sd = new StudentDetails();
            sd.setRollNumber("20RCE001");
            sd.setDepartment("CSE");
            sd.setSection("A");
            student.setStudentDetails(sd);

            Complaint complaint = new Complaint();
            complaint.setTitle("Broken Projector");

            when(sequenceGenerator.incrementSequence(Complaint.sequenceName)).thenReturn(501L);
            when(complaintRepository.save(any(Complaint.class))).thenAnswer(i -> i.getArgument(0));

            Complaint created = complaintService.addComplaint(complaint, student);

            assertThat(created.getId()).isEqualTo(501L);
            assertThat(created.getRaisedBy()).isEqualTo("20RCE001");
            assertThat(created.getRaisedFromDepartment()).isEqualTo("CSE");
            assertThat(created.getRaisedFromSection()).isEqualTo("A");
            verify(userRepository).save(student);
            assertThat(student.getComplaintDetails().getTotalComplaints()).isEqualTo(1);
            assertThat(student.getComplaintDetails().getTotalPending()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Delete Complaint Failure and Success Tests")
    class DeleteComplaintTests {

        @Test
        @DisplayName("deleteComplaint throws NotFoundException when complaint does not exist")
        void deleteComplaint_NotFound_ThrowsNotFoundException() {
            when(complaintRepository.findById(999L)).thenReturn(Optional.empty());

            User student = new User();
            assertThatThrownBy(() -> complaintService.deleteComplaint(999L, student))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Complaint not found");
        }

        @Test
        @DisplayName("deleteComplaint throws UnauthorizedException when user is another student")
        void deleteComplaint_OtherStudent_ThrowsUnauthorizedException() {
            Complaint complaint = new Complaint();
            complaint.setId(10L);
            complaint.setRaisedBy("20RCE001");

            User anotherStudent = new User();
            anotherStudent.setRole(Role.STUDENT);
            StudentDetails sd = new StudentDetails();
            sd.setRollNumber("20RCE999");
            anotherStudent.setStudentDetails(sd);

            when(complaintRepository.findById(10L)).thenReturn(Optional.of(complaint));

            assertThatThrownBy(() -> complaintService.deleteComplaint(10L, anotherStudent))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("You are not allowed to delete this complaint");
        }

        @Test
        @DisplayName("deleteComplaint succeeds for complaint owner and updates user counters")
        void deleteComplaint_OwnerSuccess() {
            Complaint complaint = new Complaint();
            complaint.setId(10L);
            complaint.setRaisedBy("20RCE001");
            complaint.setStatus(ComplaintStatus.PENDING);

            User owner = new User();
            owner.setRole(Role.STUDENT);
            StudentDetails sd = new StudentDetails();
            sd.setRollNumber("20RCE001");
            owner.setStudentDetails(sd);
            ComplaintDetails cd = new ComplaintDetails(1, 1, 0, 0, 0, 0, new ArrayList<>(List.of(complaint)));
            owner.setComplaintDetails(cd);

            when(complaintRepository.findById(10L)).thenReturn(Optional.of(complaint));

            complaintService.deleteComplaint(10L, owner);

            verify(complaintRepository).delete(complaint);
            verify(userRepository).save(owner);
            assertThat(owner.getComplaintDetails().getTotalComplaints()).isEqualTo(0);
            assertThat(owner.getComplaintDetails().getTotalPending()).isEqualTo(0);
            assertThat(owner.getComplaintDetails().getRecentComplaints()).isEmpty();
        }

        @Test
        @DisplayName("deleteComplaint succeeds for ADMIN")
        void deleteComplaint_AdminSuccess() {
            Complaint complaint = new Complaint();
            complaint.setId(10L);
            complaint.setRaisedBy("20RCE001");

            User admin = new User();
            admin.setRole(Role.ADMIN);

            when(complaintRepository.findById(10L)).thenReturn(Optional.of(complaint));

            complaintService.deleteComplaint(10L, admin);

            verify(complaintRepository).delete(complaint);
        }
    }

    @Nested
    @DisplayName("Get Complaint and Action Failure Tests")
    class ActionAndLookupTests {

        @Test
        @DisplayName("getComplaintById throws NotFoundException when complaint does not exist")
        void getComplaintById_NotFound_ThrowsNotFoundException() {
            when(complaintRepository.findById(999L)).thenReturn(Optional.empty());

            User user = new User();
            assertThatThrownBy(() -> complaintService.getComplaintById(999L, user))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Complaint not found");
        }

        @Test
        @DisplayName("addAction throws NotFoundException when complaint does not exist")
        void addAction_NotFound_ThrowsNotFoundException() {
            when(complaintRepository.findById(999L)).thenReturn(Optional.empty());

            User admin = new User();
            admin.setRole(Role.ADMIN);
            ComplaintAction action = new ComplaintAction();

            assertThatThrownBy(() -> complaintService.addAction(999L, action, admin))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Complaint not found");
        }

        @Test
        @DisplayName("getActionsByComplaintId throws NotFoundException when complaint does not exist")
        void getActionsByComplaintId_NotFound_ThrowsNotFoundException() {
            when(complaintRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> complaintService.getActionsByComplaintId(999L))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Complaint not found");
        }

        @Test
        @DisplayName("addAction transitions status and updates student details")
        void addAction_Success() {
            Complaint complaint = new Complaint();
            complaint.setId(10L);
            complaint.setStatus(ComplaintStatus.PENDING);
            complaint.setRaisedBy("20RCE001");

            User student = new User();
            student.setRole(Role.STUDENT);
            student.setComplaintDetails(new ComplaintDetails(1, 1, 0, 0, 0, 0, new ArrayList<>(List.of(complaint))));

            when(complaintRepository.findById(10L)).thenReturn(Optional.of(complaint));
            when(userRepository.findByStudentDetailsRollNumber("20RCE001")).thenReturn(Optional.of(student));
            when(complaintRepository.save(any(Complaint.class))).thenAnswer(i -> i.getArgument(0));

            User admin = new User();
            admin.setRole(Role.ADMIN);

            ComplaintAction action = new ComplaintAction();
            action.setActionType("RESOLVED");
            action.setRemarks("Fixed");

            Complaint updated = complaintService.addAction(10L, action, admin);

            assertThat(updated.getStatus()).isEqualTo(ComplaintStatus.RESOLVED);
            assertThat(updated.getActions()).hasSize(1);
            assertThat(student.getComplaintDetails().getTotalResolved()).isEqualTo(1);
            assertThat(student.getComplaintDetails().getTotalPending()).isEqualTo(0);
        }
    }
}
