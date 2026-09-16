package com.rce.complaint_box.exception;

import com.rce.complaint_box.model.enums.ResponseCode;
import org.springframework.http.HttpStatus;

public class UnauthorizedException extends AppException {

    public UnauthorizedException(String message) {
        super(ResponseCode.UNAUTHORIZED, HttpStatus.FORBIDDEN, message);
    }
}
