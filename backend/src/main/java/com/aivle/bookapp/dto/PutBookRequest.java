package com.aivle.bookapp.dto;

import jakarta.validation.constraints.NotBlank;

public record PutBookRequest(
        @NotBlank(message="도서 제목은 필수적으로 작성되어야 합니다.")
        String title,
        @NotBlank(message="도서 저자는 필수적으로 작성되어야 합니다.")
        String author,
        @NotBlank(message="도서 본문은 필수적으로 작성되어야 합니다.")
        String content,
        String coverImageUrl,
        @NotBlank(message="도서 분류는 필수적으로 작성되어야 합니다.")
        String category,
        // createdAt(생성일자)는 수정되지 않으므로 요청에 포함하지 않습니다.
        @NotBlank(message="JPA Auditing이 적용되어있지 않으므로, 수정일자를 주입해주십시오.")
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
