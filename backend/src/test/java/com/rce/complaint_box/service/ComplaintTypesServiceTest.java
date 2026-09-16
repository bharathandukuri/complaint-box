package com.rce.complaint_box.service;

import com.rce.complaint_box.dto.ComplaintTypeRequest;
import com.rce.complaint_box.exception.ConflictException;
import com.rce.complaint_box.exception.NotFoundException;
import com.rce.complaint_box.exception.ValidationException;
import com.rce.complaint_box.model.ComplaintType;
import com.rce.complaint_box.repository.ComplaintTypeRepository;
import com.rce.complaint_box.repository.complaint.ComplaintRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintTypesServiceTest {

    @Mock
    private ComplaintTypeRepository repository;

    @Mock
    private SequenceGenerator sequenceGenerator;

    @Mock
    private ComplaintRepository complaintRepository;

    @InjectMocks
    private ComplaintTypesService service;

    @Nested
    @DisplayName("Add Complaint Type Tests")
    class AddTests {

        @Test
        @DisplayName("addComplaintType throws ConflictException when title already exists")
        void addComplaintType_DuplicateTitle_ThrowsConflictException() {
            ComplaintTypeRequest request = new ComplaintTypeRequest(null, "Hostel", "Hostel complaints", "[]");
            when(repository.existsByTitle("Hostel")).thenReturn(true);

            assertThatThrownBy(() -> service.addComplaintType(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Title has already been taken");
        }

        @Test
        @DisplayName("addComplaintType succeeds when title is unique")
        void addComplaintType_Success() {
            ComplaintTypeRequest request = new ComplaintTypeRequest(null, "Hostel", "Hostel complaints", "[]");
            when(repository.existsByTitle("Hostel")).thenReturn(false);
            when(sequenceGenerator.incrementSequence(ComplaintType.sequenceName)).thenReturn(5L);
            when(repository.save(any(ComplaintType.class))).thenAnswer(i -> i.getArgument(0));

            ComplaintType created = service.addComplaintType(request);

            assertThat(created.getId()).isEqualTo(5L);
            assertThat(created.getTitle()).isEqualTo("Hostel");
        }
    }

    @Nested
    @DisplayName("Update Complaint Type Tests")
    class UpdateTests {

        @Test
        @DisplayName("updateComplaintType throws ValidationException when ID is null")
        void updateComplaintType_NullId_ThrowsValidationException() {
            ComplaintTypeRequest request = new ComplaintTypeRequest(null, "Hostel", "Hostel complaints", "[]");

            assertThatThrownBy(() -> service.updateComplaintType(request))
                    .isInstanceOf(ValidationException.class)
                    .hasMessageContaining("ID is required");
        }

        @Test
        @DisplayName("updateComplaintType throws NotFoundException when ID does not exist")
        void updateComplaintType_NotFound_ThrowsNotFoundException() {
            ComplaintTypeRequest request = new ComplaintTypeRequest(999L, "Hostel", "Hostel complaints", "[]");
            when(repository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.updateComplaintType(request))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Complaint type not found");
        }

        @Test
        @DisplayName("updateComplaintType throws ConflictException when updated title taken by another type")
        void updateComplaintType_DuplicateTitle_ThrowsConflictException() {
            ComplaintTypeRequest request = new ComplaintTypeRequest(1L, "Hostel", "desc", "[]");
            ComplaintType current = new ComplaintType(1L, "Old Title", "desc", "[]", null, null);
            ComplaintType existingOther = new ComplaintType(2L, "Hostel", "desc", "[]", null, null);

            when(repository.findById(1L)).thenReturn(Optional.of(current));
            when(repository.findByTitle("Hostel")).thenReturn(existingOther);

            assertThatThrownBy(() -> service.updateComplaintType(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessageContaining("Title has already been taken");
        }

        @Test
        @DisplayName("updateComplaintType succeeds when title belongs to the same type")
        void updateComplaintType_SameTitle_Success() {
            ComplaintTypeRequest request = new ComplaintTypeRequest(1L, "Hostel", "new desc", "[]");
            ComplaintType current = new ComplaintType(1L, "Hostel", "old desc", "[]", null, null);

            when(repository.findById(1L)).thenReturn(Optional.of(current));
            when(repository.findByTitle("Hostel")).thenReturn(current);
            when(repository.save(any(ComplaintType.class))).thenAnswer(i -> i.getArgument(0));

            ComplaintType updated = service.updateComplaintType(request);

            assertThat(updated.getDescription()).isEqualTo("new desc");
        }
    }

    @Nested
    @DisplayName("Delete Complaint Type Tests")
    class DeleteTests {

        @Test
        @DisplayName("deleteComplaintType throws NotFoundException when ID does not exist")
        void deleteComplaintType_NotFound_ThrowsNotFoundException() {
            when(repository.existsById(999L)).thenReturn(false);

            assertThatThrownBy(() -> service.deleteComplaintType(999L))
                    .isInstanceOf(NotFoundException.class)
                    .hasMessageContaining("Complaint type not found");
        }

        @Test
        @DisplayName("deleteComplaintType cascades deletion of all complaints of this type")
        void deleteComplaintType_Success() {
            when(repository.existsById(1L)).thenReturn(true);

            service.deleteComplaintType(1L);

            verify(complaintRepository).deleteByComplaintTypeId(1L);
            verify(repository).deleteById(1L);
        }
    }
}
