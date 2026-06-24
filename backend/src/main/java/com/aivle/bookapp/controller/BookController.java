package com.aivle.bookapp.controller;

import com.aivle.bookapp.dto.*;
import com.aivle.bookapp.exception.ErrorResponse;
import com.aivle.bookapp.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    // 도서 단건 조회, 상세 정보
    @Operation(summary = "도서 단건 조회")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(schema = @Schema(implementation = BookResponse.class))),
            @ApiResponse(responseCode = "404", description = "도서 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/books/{id}")
    // 반환형은 프론트엔드가 요구하는 형태일 것
    public ResponseEntity<BookResponse> getBook(@PathVariable Long id) {
        // bookService로부터 id번 책을 원본말고 BookDto에 담아 가져옴
        BookDto bookDto = bookService.getBookById(id);
        // bookService로부터 받은 bookDto를 프론트엔드를 위한 BookResponse로 재포장
        return ResponseEntity.ok(BookResponse.from(bookDto));
    }

    // 도서 삭제
    @Operation(summary = "도서 단건 삭제")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "삭제 성공",
                    content = @Content()),
            @ApiResponse(responseCode = "404", description = "도서 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/books/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        // bookService에서 id번 책 삭제
        bookService.deleteBook(id);
        // 프론트엔드에게 돌려줄 BookResponse가 없음을 알림
        return ResponseEntity.noContent().build();
    }

    // 도서 수정
    @Operation(summary = "도서 단건 수정")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공",
                    content = @Content(schema = @Schema(implementation = BookResponse.class))),
            @ApiResponse(responseCode = "404", description = "도서 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/books/{id}")
    // @RequestBody로 넘어온 JSON 데이터를 PutBookRequest에 담음
    public ResponseEntity<BookResponse> updateBook(@PathVariable Long id, @Valid @RequestBody PutBookRequest request) {
        // bookService가 읽기 편한 UpdateBookCommand로 변환
        UpdateBookCommand command = request.toCommand();
        // bookService로부터 수정된 id번 책을 command 형태로 BookDto에 담아 가져옴
        BookDto updatedBookDto = bookService.updateBook(id, command);
        // bookService로부터 받은 updatedBookDto를 프론트엔드를 위한 BookResponse로 재포장
        return ResponseEntity.ok(BookResponse.from(updatedBookDto));
    }

    // 도서 부분 수정
    @Operation(summary = "도서 부분 수정")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "부분 수정 성공",
                    content = @Content(schema = @Schema(implementation = BookResponse.class))),
            @ApiResponse(responseCode = "404", description = "도서 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PatchMapping("/books/{id}")
    // @RequestBody로 넘어온 JSON 데이터를 PatchBookRequest에 담음
    public ResponseEntity<BookResponse> patchBook(@PathVariable Long id, @Valid @RequestBody PatchBookRequest request) {
        // bookService가 읽기 편한 UpdateBookCommand로 변환
        UpdateBookCommand command = request.toCommand();
        // bookService로부터 수정된 id번 책을 command 형태로 BookDto에 담아 가져옴
        BookDto updatedBookDto = bookService.patchBook(id, command);
        // bookService로부터 받은 updatedBookDto를 프론트엔드를 위한 BookResponse로 재포장
        return ResponseEntity.ok(BookResponse.from(updatedBookDto));
    }

    // 도서 생성
    @Operation(summary = "도서 단건 생성")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "생성 성공",
                    content = @Content(schema = @Schema(implementation = BookResponse.class))),
            @ApiResponse(responseCode = "400", description = "검증 실패",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/books")
    // @RequestBody로 넘어온 JSON 데이터를 PostBookRequest에 담음
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody PostBookRequest request) {
        // bookService가 읽기 편한 CreateBookCommand로 변환
        CreateBookCommand command = request.toCommand();
        // bookService로부터 생성된 새 데이터를 command 형태로 BookDto에 담아 가져옴
        BookDto savedBookDto = bookService.createBook(command);
        // bookService로부터 받은 savedBookDto를 프론트엔드를 위한 BookResponse로 재포장
        return ResponseEntity.status(HttpStatus.CREATED).body(BookResponse.from(savedBookDto));
    }

    // 카테고리, 검색유형, 키워드 검색
    @Operation(summary = "도서 리스트 조회")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = BookResponse.class)))),
    })
    @GetMapping("/books")
    public ResponseEntity<List<BookResponse>> searchFilter(
            // null일 때는 전체 목록 조회, 조건 달면 필터링된 목록 반환
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String keyword
    ) {
        // bookService로부터 category, searchType, keyword 각 조건에 맞는 책들을 List<BookDto> 형태로 가져옴
        List<BookDto> books = bookService.searchBooksFilter(category, searchType, keyword);
        // Stream API를 사용해 stream에 Dto들을 올려놓고 BookResponse로 재포장 후 다시 하나의 리스트로 collect에 담아냄
        List<BookResponse> responses = books.stream()
                .map(BookResponse::from)
                .collect(Collectors.toList());
        // 재포장된 리스트인 responses를 프론트엔드에게 전달
        return ResponseEntity.ok(responses);
    }

    // AI 도서 표지 수정
    @Operation(summary = "도서 표지 수정")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "202", description = "수정 성공",
                    content = @Content(schema = @Schema(implementation = BookResponse.class))),
            @ApiResponse(responseCode = "404", description = "도서 없음",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PatchMapping("/books/{id}/cover")
    // @RequestBody로 넘어온 JSON 데이터를 PatchBookCoverImageUrlRequest에 담음
    public ResponseEntity<BookResponse> aiBookCover(@PathVariable Long id, @RequestBody PatchBookCoverImageUrlRequest request) {
        // bookService가 읽기 편한 UpdateBookCoverImageUrlCommand로 변환
        UpdateBookCommand command = request.toCommand();
        // bookService로부터 id번 책의 AI 표지를 command 형태로 BookDto에 담아 가져옴
        BookDto aiCoverDto = bookService.updateCoverImageUrl(id, command);
        // bookService로부터 받은 aiCoverDto를 프론트엔드를 위한 BookResponse로 재포장
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(BookResponse.from(aiCoverDto));
    }

    // AI 도서 표지 생성
    @Operation(summary = "도서 표지 생성")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "생성 성공",
                    content = @Content(schema = @Schema(implementation = BookResponse.class))),
            @ApiResponse(responseCode = "401", description = "OpenAI API Key 인증 실패",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("api/books/generate-cover")
    public ResponseEntity<Map<String, String>> generateCover(
            @RequestBody Map<String, String> requestBody,
            @RequestHeader(value = "X-OpenAI-Key", required = true) String apiKey) {

        String title = requestBody.get("title");
        String content = requestBody.get("content");
        String model = requestBody.getOrDefault("model", "gpt-image-2");
        String quality = requestBody.getOrDefault("quality", "medium");

        String b64Image = bookService.generateImageUrl(title, content, model, quality, apiKey);

        Map<String, String> response = Map.of("coverImageUrl", "data:image/png;base64," + b64Image);
        return ResponseEntity.ok(response);
    }
}
