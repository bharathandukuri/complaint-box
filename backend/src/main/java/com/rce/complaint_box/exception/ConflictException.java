package com.rce.complaint_box.exception;

import com.rce.complaint_box.model.enums.ResponseCode;
import org.springframework.http.HttpStatus;

public class ConflictException extends AppException {

    public ConflictException(String message) {
        super(ResponseCode.CONFLICT, HttpStatus.CONFLICT, message);
    }

    public ConflictException(ResponseCode code, String message) {
        super(code, HttpStatus.CONFLICT, message);
    }
}
