package com.c202.exception.types;

import com.c202.exception.CustomException;

public class ConflictException extends CustomException {
    public ConflictException(String message) {
        super(message, 409);
    }
}