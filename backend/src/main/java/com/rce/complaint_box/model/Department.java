package com.rce.complaint_box.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "departments")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Department {

    @Id
    private String code;

    @Indexed(unique = true)
    private String name;
    private List<Section> sections;
}
