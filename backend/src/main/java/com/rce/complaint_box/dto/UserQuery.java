package com.rce.complaint_box.dto;

import lombok.Data;

@Data
public class UserQuery {
    public Long lastID;
    public int size = 20;
    public String searchKey = "";
    public String searchProperty = "name";
    public String role = "ALL";
    public String department = "ALL";
    public String section = "";
    public String academicYear = "";
}