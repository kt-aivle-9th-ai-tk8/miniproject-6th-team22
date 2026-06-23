package com.aivle.bookapp.dto;

import com.aivle.bookapp.domain.Book;

public record CreateBookCommand(
        String title,
        String author,
        String content,
        String coverImageUrl,
        String category,
        String createdAt,
        String updatedAt
) {
    public Book toBook() {
        return Book.builder()
                .title(title)
                .author(author)
                .content(content)
                .coverImageUrl(coverImageUrl)
                .category(category)
                .createdAt(createdAt)
                .updatedAt(updatedAt)
                .build();
    }
}
