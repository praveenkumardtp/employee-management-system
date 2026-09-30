package com.portfolio.ems.exception;

import org.springframework.http.HttpStatus;

public class EmsException extends RuntimeException {
    private final HttpStatus status;

    public EmsException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
