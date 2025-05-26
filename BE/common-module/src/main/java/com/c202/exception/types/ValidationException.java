package com.c202.exception.types;

import com.c202.exception.CustomException;

public class ValidationException extends CustomException {
    public ValidationException(String message) {
        super(message, 400);
    }
}