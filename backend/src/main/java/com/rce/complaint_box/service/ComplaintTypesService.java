package com.rce.complaint_box.service;

import java.util.List;

import com.rce.complaint_box.dto.ComplaintTypeRequest;
import com.rce.complaint_box.exception.ConflictException;
import com.rce.complaint_box.exception.NotFoundException;
import com.rce.complaint_box.exception.ValidationException;
import com.rce.complaint_box.repository.complaint.ComplaintRepository;
import org.springframework.stereotype.Service;

import com.rce.complaint_box.model.ComplaintType;
import com.rce.complaint_box.repository.ComplaintTypeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ComplaintTypesService {

    private final ComplaintTypeRepository repository;
    private final SequenceGenerator sequenceGenerator;
    private final ComplaintRepository complaintRepository;

    public List<ComplaintType> getAllComplaintTypes() {
        return repository.findAll();
    }

    public ComplaintType addComplaintType(ComplaintTypeRequest request) {
        if (repository.existsByTitle(request.getTitle())) {
            throw new ConflictException("Title has already been taken.");
        }

        ComplaintType complaintType = new ComplaintType();
        complaintType.setId(sequenceGenerator.incrementSequence(ComplaintType.sequenceName));
        complaintType.setTitle(request.getTitle());
        complaintType.setDescription(request.getDescription());
        complaintType.setFields(request.getFields());

        return repository.save(complaintType);
    }

    public ComplaintType updateComplaintType(ComplaintTypeRequest request) {
        if (request.getId() == null) {
            throw new ValidationException("ID is required.");
        }

        ComplaintType complaintType = repository.findById(request.getId())
                .orElseThrow(() -> new NotFoundException("Complaint type not found."));

        ComplaintType existingByTitle = repository.findByTitle(request.getTitle());
        if (existingByTitle != null && !existingByTitle.getId().equals(request.getId())) {
            throw new ConflictException("Title has already been taken.");
        }

        complaintType.setTitle(request.getTitle());
        complaintType.setDescription(request.getDescription());
        complaintType.setFields(request.getFields());

        return repository.save(complaintType);
    }

    public void deleteComplaintType(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Complaint type not found.");
        }

        complaintRepository.deleteByComplaintTypeId(id);
        repository.deleteById(id);
    }
}
