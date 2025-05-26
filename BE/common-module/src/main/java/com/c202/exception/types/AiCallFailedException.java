package com.c202.exception.types;

import com.c202.exception.CustomException;

public class AiCallFailedException extends CustomException {
    public AiCallFailedException(String message) {
        super(message, 400);
    }
}