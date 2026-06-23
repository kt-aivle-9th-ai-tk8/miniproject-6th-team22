package com.aivle.bookapp.dto;

public record UpdateBookCommand(
        String title,
        String author,
        String content,
        String coverImageUrl,
        String category,
        String updatedAt
) {
}
