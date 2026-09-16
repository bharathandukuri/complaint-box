package com.rce.complaint_box.service;

import com.rce.complaint_box.dto.DepartmentRequest;
import com.rce.complaint_box.dto.SectionRequest;
import com.rce.complaint_box.exception.ConflictException;
import com.rce.complaint_box.exception.NotFoundException;
import com.rce.complaint_box.exception.ValidationException;
import com.rce.complaint_box.model.Department;
import com.rce.complaint_box.model.Section;
import com.rce.complaint_box.repository.DepartmentRepository;
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
class DepartmentServiceTest {

    @Mock
    private DepartmentRepository repository;

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DepartmentService departmentService;

    @Nested
    @DisplayName("Create Department Failure and Success Tests")
    class CreateDepartmentTests {

        @Test
        @DisplayName("createDepartment throws ValidationException on duplicate section names")
        void createDepartment_DuplicateSections_ThrowsValidationException() {
            DepartmentRequest request = new DepartmentRequest("CSE", "Computer Science",
                    List.of(new SectionRequest("A"), new SectionRequest("A")));

            assertThatThrownBy(() -> departmentService.createDepartment(request))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Duplicate section name detected");
        }

        @Test
        @DisplayName("createDepartment throws ConflictException when code already exists")
        void createDepartment_DuplicateCode_ThrowsConflictException() {
            DepartmentRequest request = new DepartmentRequest("CSE", "Computer Science",
                    List.of(new SectionRequest("A"), new SectionRequest("B")));
            when(repository.existsByCode("CSE")).thenReturn(true);

            assertThatThrownBy(() -> departmentService.createDepartment(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Department code already exists");
        }

        @Test
        @DisplayName("createDepartment throws ConflictException when name already exists")
        void createDepartment_DuplicateName_ThrowsConflictException() {
            DepartmentRequest request = new DepartmentRequest("CSE", "Computer Science",
                    List.of(new SectionRequest("A"), new SectionRequest("B")));
            when(repository.existsByCode("CSE")).thenReturn(false);
            when(repository.existsByName("Computer Science")).thenReturn(true);

            assertThatThrownBy(() -> departmentService.createDepartment(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Department name already exists");
        }

        @Test
        @DisplayName("createDepartment succeeds when valid")
        void createDepartment_Success() {
            DepartmentRequest request = new DepartmentRequest("CSE", "Computer Science",
                    List.of(new SectionRequest("A"), new SectionRequest("B")));
            when(repository.existsByCode("CSE")).thenReturn(false);
            when(repository.existsByName("Computer Science")).thenReturn(false);
            when(repository.save(any(Department.class))).thenAnswer(i -> i.getArgument(0));

            Department created = departmentService.createDepartment(request);

            assertThat(created.getCode()).isEqualTo("CSE");
            assertThat(created.getName()).isEqualTo("Computer Science");
            assertThat(created.getSections()).hasSize(2);
        }
    }

    @Nested
    @DisplayName("Get Department Failure and Success Tests")
    class GetDepartmentTests {

        @Test
        @DisplayName("getDepartmentByCode throws NotFoundException when department does not exist")
        void getDepartmentByCode_NotFound_ThrowsNotFoundException() {
            when(repository.findById("UNKNOWN")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> departmentService.getDepartmentByCode("UNKNOWN"))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Department not found");
        }

        @Test
        @DisplayName("getDepartmentByCode returns department when found")
        void getDepartmentByCode_Success() {
            Department dept = new Department("CSE", "Computer Science", List.of(new Section("A")));
            when(repository.findById("CSE")).thenReturn(Optional.of(dept));

            Department found = departmentService.getDepartmentByCode("CSE");

            assertThat(found.getCode()).isEqualTo("CSE");
        }
    }

    @Nested
    @DisplayName("Update Department Failure and Success Tests")
    class UpdateDepartmentTests {

        @Test
        @DisplayName("updateDepartment throws ValidationException on duplicate section names")
        void updateDepartment_DuplicateSections_ThrowsValidationException() {
            DepartmentRequest request = new DepartmentRequest("CSE", "Computer Science Updated",
                    List.of(new SectionRequest("A"), new SectionRequest("A")));

            assertThatThrownBy(() -> departmentService.updateDepartment("CSE", request))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("Duplicate section name detected");
        }

        @Test
        @DisplayName("updateDepartment throws NotFoundException when department does not exist")
        void updateDepartment_NotFound_ThrowsNotFoundException() {
            DepartmentRequest request = new DepartmentRequest("CSE", "Computer Science Updated",
                    List.of(new SectionRequest("A")));
            when(repository.findById("CSE")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> departmentService.updateDepartment("CSE", request))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Department not found");
        }

        @Test
        @DisplayName("updateDepartment cascades deletions for removed sections")
        void updateDepartment_CascadesSectionDeletions() {
            Department existing = new Department("CSE", "Computer Science",
                    new ArrayList<>(List.of(new Section("A"), new Section("B"), new Section("C"))));

            DepartmentRequest request = new DepartmentRequest("CSE", "Computer Science Updated",
                    List.of(new SectionRequest("A")));

            when(repository.findById("CSE")).thenReturn(Optional.of(existing));
            when(repository.save(any(Department.class))).thenAnswer(i -> i.getArgument(0));

            departmentService.updateDepartment("CSE", request);

            // B and C should be cascade deleted
            verify(complaintRepository).deleteByRaisedFromDepartmentAndRaisedFromSection("CSE", "B");
            verify(complaintRepository).deleteByRaisedFromDepartmentAndRaisedFromSection("CSE", "C");
            verify(userRepository).deleteByStudentDetailsDepartmentAndStudentDetailsSection("CSE", "B");
            verify(userRepository).deleteByStudentDetailsDepartmentAndStudentDetailsSection("CSE", "C");
        }
    }

    @Nested
    @DisplayName("Delete Department Failure and Success Tests")
    class DeleteDepartmentTests {

        @Test
        @DisplayName("deleteDepartment throws NotFoundException when department does not exist")
        void deleteDepartment_NotFound_ThrowsNotFoundException() {
            when(repository.existsById("UNKNOWN")).thenReturn(false);

            assertThatThrownBy(() -> departmentService.deleteDepartment("UNKNOWN"))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Department not found");
        }

        @Test
        @DisplayName("deleteDepartment cascades all complaints and users before deletion")
        void deleteDepartment_Success() {
            when(repository.existsById("CSE")).thenReturn(true);

            departmentService.deleteDepartment("CSE");

            verify(complaintRepository).deleteByRaisedFromDepartment("CSE");
            verify(userRepository).deleteByMentorDetailsDepartment("CSE");
            verify(userRepository).deleteByStudentDetailsDepartment("CSE");
            verify(repository).deleteById("CSE");
        }
    }
}
