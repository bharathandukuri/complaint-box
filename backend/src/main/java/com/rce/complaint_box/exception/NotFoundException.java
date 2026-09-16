package com.rce.complaint_box.exception;

import com.rce.complaint_box.model.enums.ResponseCode;
import org.springframework.http.HttpStatus;

public class NotFoundException extends AppException {

    public NotFoundException(String message) {
        super(ResponseCode.NOT_FOUND, HttpStatus.NOT_FOUND, message);
    }

    public NotFoundException(ResponseCode code, String message) {
        super(code, HttpStatus.NOT_FOUND, message);
    }
}
