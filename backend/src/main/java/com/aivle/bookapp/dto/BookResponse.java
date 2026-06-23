package com.aivle.bookapp.dto;

public record BookResponse(
        Long id,
        String title,
        String author,
        String content,
        String coverImageUrl,
        String category,
        String createdAt,
        String updatedAt
) {
    public static BookResponse from(BookDto bookDto) {
        return new BookResponse(
                bookDto.id(),
                bookDto.title(),
                bookDto.author(),
                bookDto.content(),
                bookDto.coverImageUrl(),
                bookDto.category(),
                bookDto.createdAt(),
                bookDto.updatedAt()
        );
    }
}
