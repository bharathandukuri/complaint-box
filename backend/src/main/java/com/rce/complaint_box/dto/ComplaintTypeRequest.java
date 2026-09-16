package com.rce.complaint_box.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintTypeRequest {

    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String fields;
}
