package com.c202.exception;

import com.c202.dto.ResponseDto;
import com.c202.exception.types.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ResponseDto<Void>> handleBadRequest(BadRequestException ex) {
        return ResponseEntity.status(400).body(ResponseDto.error(400, ex.getMessage()));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ResponseDto<Void>> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(404).body(ResponseDto.error(404, ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ResponseDto<Void>> handleUnauthorized(UnauthorizedException ex) {
        return ResponseEntity.status(401).body(ResponseDto.error(401, ex.getMessage()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ResponseDto<Void>> handleConflict(ConflictException ex) {
        return ResponseEntity.status(409).body(ResponseDto.error(409, ex.getMessage()));
    }

    @ExceptionHandler(TooManyRequestsException.class)
    public ResponseEntity<ResponseDto<Void>> handleTooManyRequests(TooManyRequestsException ex) {
        return ResponseEntity.status(429).body(ResponseDto.error(429, ex.getMessage()));
    }

    @ExceptionHandler(UnsupportedMediaTypeException.class)
    public ResponseEntity<ResponseDto<Void>> handleUnsupportedMediaType(UnsupportedMediaTypeException ex) {
        return ResponseEntity.status(415).body(ResponseDto.error(415, ex.getMessage()));
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ResponseDto<Void>> handleValidation(ValidationException ex) {
        return ResponseEntity.status(400).body(ResponseDto.error(400, ex.getMessage()));
    }

    @ExceptionHandler(AiCallFailedException.class)
    public ResponseEntity<ResponseDto<Void>> handleAiCallFailedException(AiCallFailedException ex) {
        return ResponseEntity.status(500).body(ResponseDto.error(500, ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseDto<Void>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("잘못된 요청입니다.");
        return ResponseEntity.status(400).body(ResponseDto.error(400, errorMessage));
    }

    @ExceptionHandler(AlreadyExistsException.class)
    public ResponseEntity<ResponseDto<Void>> handleAlreadyExists(AlreadyExistsException ex) {
        return ResponseEntity.status(409).body(ResponseDto.error(409, ex.getMessage()));
    }

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ResponseDto<Void>> handleCustomException(CustomException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(ResponseDto.error(ex.getStatusCode(), ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseDto<Void>> handleGenericException(Exception e) {
        return ResponseEntity.status(500).body(ResponseDto.error(500, "서버 오류가 발생했습니다."));
    }

    @ExceptionHandler(WebClientCommunicationException.class)
    public ResponseEntity<ResponseDto<Void>> handleWebClientCommunication(WebClientCommunicationException ex){
        return ResponseEntity.status(502).body(ResponseDto.error(502, ex.getMessage()));
    }
}