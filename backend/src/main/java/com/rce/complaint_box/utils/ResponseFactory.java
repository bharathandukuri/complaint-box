package com.rce.complaint_box.utils;

import org.springframework.http.ResponseEntity;

import com.rce.complaint_box.model.ApiResponse;
import com.rce.complaint_box.model.enums.ResponseCode;

public class ResponseFactory {

    public static <T> ResponseEntity<ApiResponse<T>> success(String message) {
        return ResponseEntity.ok(new ApiResponse<>(ResponseCode.SUCCESS, message, null));
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(String message, T data) {
        return ResponseEntity.ok(new ApiResponse<>(ResponseCode.SUCCESS, message, data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(ResponseCode code, String message) {
        return ResponseEntity.ok(new ApiResponse<>(code, message, null));
    }

    public static <T> ResponseEntity<ApiResponse<T>> success(ResponseCode code, String message, T data) {
        return ResponseEntity.ok(new ApiResponse<>(code, message, data));
    }
}
