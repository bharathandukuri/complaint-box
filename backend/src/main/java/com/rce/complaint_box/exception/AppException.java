package com.rce.complaint_box.exception;

import com.rce.complaint_box.model.enums.ResponseCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AppException extends RuntimeException {

    private final ResponseCode code;
    private final HttpStatus status;

    public AppException(ResponseCode code, HttpStatus status, String message) {
        super(message);
        this.code = code;
        this.status = status;
    }
}
