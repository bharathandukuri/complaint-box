package com.rce.complaint_box.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileDetails {
    @Transient
    public static final String sequenceName = "files_sequence";

    @Id
    private Long id;
    private String originalName;

    @Indexed
    private Long uploadedBy;
}
