package com.rce.complaint_box.model;

import com.rce.complaint_box.model.enums.ResponseCode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private ResponseCode code;
    private String message;
    private T data;
}
