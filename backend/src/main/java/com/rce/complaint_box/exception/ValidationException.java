package com.rce.complaint_box.exception;

import com.rce.complaint_box.model.enums.ResponseCode;
import org.springframework.http.HttpStatus;

public class ValidationException extends AppException {

    public ValidationException(String message) {
        super(ResponseCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, message);
    }
}
