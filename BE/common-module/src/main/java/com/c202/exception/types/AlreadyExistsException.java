package com.c202.exception.types;

import com.c202.exception.CustomException;

public class AlreadyExistsException extends CustomException {
    public AlreadyExistsException(String message) {
        super(message, 409);
    }
}