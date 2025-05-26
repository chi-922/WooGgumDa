package com.c202.exception.types;

import com.c202.exception.CustomException;

public class BadRequestException extends CustomException {
    public BadRequestException(String message) {
        super(message, 400);
    }
}