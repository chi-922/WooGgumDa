package com.c202.exception.types;

import com.c202.exception.CustomException;

public class NotFoundException extends CustomException {
    public NotFoundException(String message) {
        super(message, 404);
    }
}