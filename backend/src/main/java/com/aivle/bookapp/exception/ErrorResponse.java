package com.aivle.bookapp.exception;

public record ErrorResponse (

    int status,
    String message
) {
}