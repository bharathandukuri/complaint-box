package com.rce.complaint_box.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.rce.complaint_box.exception.NotFoundException;
import com.rce.complaint_box.exception.UnauthorizedException;
import com.rce.complaint_box.model.ComplaintAction;
import com.rce.complaint_box.model.User;
import com.rce.complaint_box.model.enums.ComplaintStatus;
import org.springframework.stereotype.Service;

import com.rce.complaint_box.dto.ComplaintQuery;
import com.rce.complaint_box.model.Complaint;
import com.rce.complaint_box.model.ComplaintDetails;
import com.rce.complaint_box.model.enums.Role;
import com.rce.complaint_box.repository.complaint.ComplaintRepository;
import com.rce.complaint_box.repository.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final SequenceGenerator sequenceGenerator;

    public List<Complaint> getStudentComplaints(User user) {
        String rollNumber = user.getStudentDetails().getRollNumber();
        return complaintRepository.findByRaisedBy(rollNumber);
    }

    public Complaint addComplaint(Complaint complaint, User user) {
        if (user.getStudentDetails() == null) {
            throw new UnauthorizedException("Only students can raise complaints.");
        }

        Long complaintId = sequenceGenerator.incrementSequence(Complaint.sequenceName);
        complaint.setId(complaintId);

        if (user.getComplaintDetails() == null) {
            user.setComplaintDetails(new ComplaintDetails());
        }
        var complaintDetails = user.getComplaintDetails();

        complaintDetails.setTotalComplaints(complaintDetails.getTotalComplaints() + 1);
        complaintDetails.setTotalPending(complaintDetails.getTotalPending() + 1);

        List<Complaint> recentList = complaintDetails.getRecentComplaints();
        if (recentList == null) {
            recentList = new ArrayList<>();
        }

        recentList.add(0, complaint);

        if (recentList.size() > 10) {
            recentList = recentList.subList(0, 10);
        }

        complaintDetails.setRecentComplaints(recentList);
        user.setComplaintDetails(complaintDetails);
        userRepository.save(user);

        if (!complaint.isAnonymous()) {
            complaint.setRaisedBy(user.getStudentDetails().getRollNumber());
        }
        complaint.setRaisedFromDepartment(user.getStudentDetails().getDepartment());
        complaint.setRaisedFromSection(user.getStudentDetails().getSection());

        return complaintRepository.save(complaint);
    }

    public void deleteComplaint(Long complaintId, User user) {
        var complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new NotFoundException("Complaint not found."));

        var role = user.getRole();

        boolean isOwner = user.getStudentDetails() != null
                && complaint.getRaisedBy() != null
                && complaint.getRaisedBy().equals(user.getStudentDetails().getRollNumber());

        if (!(isOwner || role == Role.ADMIN || role == Role.MENTOR)) {
            throw new UnauthorizedException("You are not allowed to delete this complaint.");
        }

        complaintRepository.delete(complaint);

        if (isOwner && user.getComplaintDetails() != null) {
            var details = user.getComplaintDetails();

            details.setTotalComplaints(Math.max(0, details.getTotalComplaints() - 1));

            if (complaint.getStatus() != null) {
                switch (complaint.getStatus()) {
                    case PENDING -> details.setTotalPending(Math.max(0, details.getTotalPending() - 1));
                    case IN_PROGRESS -> details.setTotalInProgress(Math.max(0, details.getTotalInProgress() - 1));
                    case RESOLVED -> details.setTotalResolved(Math.max(0, details.getTotalResolved() - 1));
                    case REJECTED -> details.setTotalRejected(Math.max(0, details.getTotalRejected() - 1));
                    case ESCALATED -> details.setTotalEscalated(Math.max(0, details.getTotalEscalated() - 1));
                }
            }

            if (details.getRecentComplaints() != null) {
                details.getRecentComplaints().removeIf(c -> c.getId().equals(complaintId));
            }

            userRepository.save(user);
        }
    }

    public Complaint getComplaintById(Long id, User user) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Complaint not found."));
    }

    public List<Complaint> getComplaints(ComplaintQuery query, User user) {
        var role = user.getRole();
        if (role == Role.MENTOR) {
            query.employeeID = user.getMentorDetails().getEmployeeID();
        }
        return complaintRepository.getComplaintsByComplaintQuery(query);
    }

    public Complaint addAction(Long complaintId, ComplaintAction action, User user) {
        action.setPerformedAt(new Date());

        if (user.getRole() == Role.ADMIN) {
            action.setPerformedBy("ADMIN");
        } else {
            action.setPerformedBy("MENTOR-" + user.getMentorDetails().getEmployeeID());
        }

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new NotFoundException("Complaint not found."));

        ComplaintStatus oldStatus = complaint.getStatus();

        if (action.getActionType() != null) {
            switch (action.getActionType().toUpperCase()) {
                case "RESOLVED" -> complaint.setStatus(ComplaintStatus.RESOLVED);
                case "ESCALATED" -> complaint.setStatus(ComplaintStatus.ESCALATED);
                case "REJECTED" -> complaint.setStatus(ComplaintStatus.REJECTED);
                case "IN_PROGRESS" -> complaint.setStatus(ComplaintStatus.IN_PROGRESS);
            }
        }

        if (complaint.getActions() != null) {
            complaint.getActions().add(action);
        } else {
            complaint.setActions(new ArrayList<>(List.of(action)));
        }

        if (complaint.getRaisedBy() != null) {
            var userOpt = userRepository.findByStudentDetailsRollNumber(complaint.getRaisedBy());
            if (userOpt.isPresent()) {
                User student = userOpt.get();
                if (student.getComplaintDetails() == null) {
                    student.setComplaintDetails(new ComplaintDetails(0, 0, 0, 0, 0, 0, null));
                }
                var details = student.getComplaintDetails();

                if (oldStatus != null) {
                    switch (oldStatus) {
                        case PENDING -> details.setTotalPending(details.getTotalPending() - 1);
                        case IN_PROGRESS -> details.setTotalInProgress(details.getTotalInProgress() - 1);
                        case RESOLVED -> details.setTotalResolved(details.getTotalResolved() - 1);
                        case REJECTED -> details.setTotalRejected(details.getTotalRejected() - 1);
                        case ESCALATED -> details.setTotalEscalated(details.getTotalEscalated() - 1);
                    }
                }

                switch (complaint.getStatus()) {
                    case PENDING -> details.setTotalPending(details.getTotalPending() + 1);
                    case IN_PROGRESS -> details.setTotalInProgress(details.getTotalInProgress() + 1);
                    case RESOLVED -> details.setTotalResolved(details.getTotalResolved() + 1);
                    case REJECTED -> details.setTotalRejected(details.getTotalRejected() + 1);
                    case ESCALATED -> details.setTotalEscalated(details.getTotalEscalated() + 1);
                }

                var recentList = details.getRecentComplaints();
                if (recentList == null)
                    recentList = new ArrayList<>();
                if (!recentList.contains(complaint)) {
                    recentList.add(0, complaint);
                    if (recentList.size() > 10)
                        recentList = recentList.subList(0, 10);
                }
                details.setRecentComplaints(recentList);

                student.setComplaintDetails(details);
                userRepository.save(student);
            }
        }

        return complaintRepository.save(complaint);
    }

    public List<ComplaintAction> getActionsByComplaintId(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new NotFoundException("Complaint not found."));

        return complaint.getActions();
    }
}
