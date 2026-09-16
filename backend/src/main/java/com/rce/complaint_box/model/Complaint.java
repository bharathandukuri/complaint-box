package com.rce.complaint_box.model;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.IndexDirection;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.rce.complaint_box.model.enums.ComplaintStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "complaints")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Complaint {

    public static final String sequenceName = "complaint_sequence";

    @Id
    @Indexed(direction = IndexDirection.DESCENDING)
    private Long id;

    private boolean anonymous;

    @Indexed
    private String raisedBy;

    @Indexed
    private String raisedFromDepartment;

    @Indexed
    private String raisedFromSection;

    @Indexed
    private Long complaintTypeId;

    private String title;
    private String description;

    @Indexed
    private ComplaintStatus status = ComplaintStatus.PENDING;

    private List<ComplaintAction> actions;

    private Map<String, Object> meta;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;
}
