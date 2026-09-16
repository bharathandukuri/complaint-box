package com.rce.complaint_box.model;

import java.util.Date;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "complaint_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintType {

    public static final String sequenceName = "complaint_types";

    @Id
    private Long id;
    @Indexed(unique = true)
    private String title;
    private String description;
    private String fields;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;
}
