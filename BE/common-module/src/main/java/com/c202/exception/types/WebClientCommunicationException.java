package com.c202.exception.types;

import com.c202.exception.CustomException;

public class WebClientCommunicationException extends CustomException {
    public WebClientCommunicationException(String message) { super(message, 502); };
}
