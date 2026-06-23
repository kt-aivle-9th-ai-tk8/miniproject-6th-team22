package com.aivle.bookapp.dto;

import jakarta.validation.constraints.NotNull;

public record PatchBookRequest(
        String title,
        String author,
        String content,
        String coverImageUrl,
        String category,
        // createdAt(생성일자)는 수정되지 않으므로 요청에 포함하지 않습니다.
        @NotNull(message="JPA Auditing이 적용되어있지 않으므로, 수정일자를 주입해주십시오.")
        String updatedAt
) {
    public UpdateBookCommand toCommand() {
        return new UpdateBookCommand(
                this.title,
                this.author,
                this.content,
                this.coverImageUrl,
                this.category,
                this.updatedAt
        );
    }
}
