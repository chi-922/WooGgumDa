package com.c202.exception.types;

import com.c202.exception.CustomException;

public class UnauthorizedException extends CustomException {
    public UnauthorizedException(String message) {
        super(message, 401);
    }
}