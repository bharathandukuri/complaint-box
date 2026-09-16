package com.rce.complaint_box.exception;

import com.rce.complaint_box.exception.handler.GlobalExceptionHandler;
import com.rce.complaint_box.model.ApiResponse;
import com.rce.complaint_box.model.enums.ResponseCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("handleAppException handles NotFoundException with 404 and NOT_FOUND code")
    void handleAppException_NotFound() {
        NotFoundException ex = new NotFoundException("Resource missing");

        ResponseEntity<ApiResponse<Void>> response = handler.handleAppException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(ResponseCode.NOT_FOUND);
        assertThat(response.getBody().getMessage()).isEqualTo("Resource missing");
    }

    @Test
    @DisplayName("handleAppException handles ConflictException with 409 and CONFLICT code")
    void handleAppException_Conflict() {
        ConflictException ex = new ConflictException("Already exists");

        ResponseEntity<ApiResponse<Void>> response = handler.handleAppException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(ResponseCode.CONFLICT);
        assertThat(response.getBody().getMessage()).isEqualTo("Already exists");
    }

    @Test
    @DisplayName("handleAppException handles ValidationException with 400 and VALIDATION_ERROR code")
    void handleAppException_Validation() {
        ValidationException ex = new ValidationException("Invalid format");

        ResponseEntity<ApiResponse<Void>> response = handler.handleAppException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(ResponseCode.VALIDATION_ERROR);
        assertThat(response.getBody().getMessage()).isEqualTo("Invalid format");
    }

    @Test
    @DisplayName("handleAppException handles UnauthorizedException with 403 and UNAUTHORIZED code")
    void handleAppException_Unauthorized() {
        UnauthorizedException ex = new UnauthorizedException("Forbidden access");

        ResponseEntity<ApiResponse<Void>> response = handler.handleAppException(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(ResponseCode.UNAUTHORIZED);
        assertThat(response.getBody().getMessage()).isEqualTo("Forbidden access");
    }

    @Test
    @DisplayName("handleValidation aggregates field errors and returns 400")
    void handleValidation_AggregatesFieldErrors() {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "target");
        bindingResult.addError(new FieldError("target", "username", "Username is required"));
        bindingResult.addError(new FieldError("target", "password", "Password is required"));

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<ApiResponse<Void>> response = handler.handleValidation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(ResponseCode.VALIDATION_ERROR);
        assertThat(response.getBody().getMessage())
                .contains("username: Username is required")
                .contains("password: Password is required");
    }

    @Test
    @DisplayName("handleGeneric returns 500 with generic error message")
    void handleGeneric_ReturnsInternalServerError() {
        RuntimeException ex = new RuntimeException("Null pointer in database driver");

        ResponseEntity<ApiResponse<Void>> response = handler.handleGeneric(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(ResponseCode.ERROR);
        assertThat(response.getBody().getMessage()).isEqualTo("An unexpected error occurred.");
    }
}
