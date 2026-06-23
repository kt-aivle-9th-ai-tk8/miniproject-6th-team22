package com.aivle.bookapp.dto;

public record PatchBookCoverImageUrlRequest (
        String coverImageUrl
) {
    public UpdateBookCommand toCommand() {
        return new UpdateBookCommand(
                null,
                null,
                null,
                this.coverImageUrl,
                null,
                null
        );
    }
}
