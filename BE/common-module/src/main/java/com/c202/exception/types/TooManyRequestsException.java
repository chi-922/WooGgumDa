package com.c202.exception.types;

import com.c202.exception.CustomException;

public class TooManyRequestsException extends CustomException {
    public TooManyRequestsException(String message) {
        super(message, 429);
    }
}