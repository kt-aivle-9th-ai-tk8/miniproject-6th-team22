package com.aivle.bookapp.dto;

import com.aivle.bookapp.domain.Book;

public record BookDto(
        Long id,
        String title,
        String author,
        String content,
        String coverImageUrl,
        String category,
        String createdAt,
        String updatedAt
) {
    public static BookDto from(Book book) {
        return new BookDto(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getContent(),
                book.getCoverImageUrl(),
                book.getCategory(),
                book.getCreatedAt(),
                book.getUpdatedAt()
        );
    }
}
