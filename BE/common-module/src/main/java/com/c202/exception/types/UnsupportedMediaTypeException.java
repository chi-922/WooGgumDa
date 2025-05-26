package com.c202.exception.types;

import com.c202.exception.CustomException;

public class UnsupportedMediaTypeException extends CustomException {
    public UnsupportedMediaTypeException(String message) {
        super(message, 415);
    }
}