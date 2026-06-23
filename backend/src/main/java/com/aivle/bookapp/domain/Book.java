package com.aivle.bookapp.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.validator.constraints.Length;

@Getter
@Setter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE) // builder 사용 위한 생성
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, length=50) // DB 제약 (DB DDL)
    @NotBlank               // Bean Validation
    @Length(max=50)         // Bean Validation
    private String title;

    @Column(nullable=false, length=30) // DB 제약 (DB DDL)
    @NotBlank               // Bean Validation
    @Length(max=30)         // Bean Validation
    private String author;

    @Column(nullable=false, length=500) // DB 제약 (DB DDL)
    @Lob                    // 방대한 텍스트 저장 명시 (DB DDL)
    @NotBlank               // Bean Validation
    @Length(max=500)        // Bean Validation
    private String content;

    @Lob                    // 방대한 텍스트 저장 명시 (DB DDL)
    private String coverImageUrl;

    @Column(nullable=false, length=50)  // DB 제약 (DB DDL)
    @NotBlank                           // Bean Validation
    @Length(max=50)                     // Bean Validation
    private String category;

    private String createdAt;

    private String updatedAt;
}
