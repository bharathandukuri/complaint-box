package com.rce.complaint_box.service;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import com.rce.complaint_box.dto.DepartmentRequest;
import com.rce.complaint_box.dto.SectionRequest;
import com.rce.complaint_box.exception.ConflictException;
import com.rce.complaint_box.exception.NotFoundException;
import com.rce.complaint_box.exception.ValidationException;
import com.rce.complaint_box.repository.complaint.ComplaintRepository;
import com.rce.complaint_box.repository.user.UserRepository;

import org.springframework.stereotype.Service;

import com.rce.complaint_box.model.Department;
import com.rce.complaint_box.model.Section;
import com.rce.complaint_box.repository.DepartmentRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository repository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public List<Department> getDepartments() {
        return repository.findAll();
    }

    public Department createDepartment(DepartmentRequest request) {
        validateUniqueSections(request.getSections());

        if (repository.existsByCode(request.getCode())) {
            throw new ConflictException("Department code already exists.");
        }
        if (repository.existsByName(request.getName())) {
            throw new ConflictException("Department name already exists.");
        }

        Department department = new Department();
        department.setCode(request.getCode());
        department.setName(request.getName());
        department.setSections(toSections(request.getSections()));

        return repository.save(department);
    }

    public Department getDepartmentByCode(String code) {
        return repository.findById(code)
                .orElseThrow(() -> new NotFoundException("Department not found."));
    }

    @Transactional
    public Department updateDepartment(String code, DepartmentRequest request) {
        validateUniqueSections(request.getSections());

        Department existing = repository.findById(code)
                .orElseThrow(() -> new NotFoundException("Department not found."));

        HashSet<String> oldSectionNames = new HashSet<>();
        for (Section section : existing.getSections()) {
            oldSectionNames.add(section.getName());
        }

        HashSet<String> newSectionNames = new HashSet<>();
        for (SectionRequest section : request.getSections()) {
            newSectionNames.add(section.getName());
        }

        oldSectionNames.removeAll(newSectionNames);

        // Cascade-delete complaints and users from removed sections
        for (String removedSection : oldSectionNames) {
            complaintRepository.deleteByRaisedFromDepartmentAndRaisedFromSection(code, removedSection);
            userRepository.deleteByStudentDetailsDepartmentAndStudentDetailsSection(code, removedSection);
        }

        boolean codeChanged = !code.equals(request.getCode());

        existing.setName(request.getName());
        existing.setSections(toSections(request.getSections()));

        if (codeChanged) {
            existing.setCode(request.getCode());
            repository.deleteById(code);
        }

        return repository.save(existing);
    }

    @Transactional
    public void deleteDepartment(String code) {
        if (!repository.existsById(code)) {
            throw new NotFoundException("Department not found.");
        }

        complaintRepository.deleteByRaisedFromDepartment(code);
        userRepository.deleteByMentorDetailsDepartment(code);
        userRepository.deleteByStudentDetailsDepartment(code);
        repository.deleteById(code);
    }

    private void validateUniqueSections(List<SectionRequest> sections) {
        HashSet<String> seen = new HashSet<>();
        for (SectionRequest section : sections) {
            if (!seen.add(section.getName())) {
                throw new ValidationException("Duplicate section name detected: " + section.getName());
            }
        }
    }

    private List<Section> toSections(List<SectionRequest> requests) {
        return requests.stream()
                .map(r -> new Section(r.getName()))
                .collect(Collectors.toList());
    }
}