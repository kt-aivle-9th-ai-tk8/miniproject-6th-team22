package com.aivle.bookapp.service;

import com.aivle.bookapp.domain.Book;
import com.aivle.bookapp.dto.BookDto;
import com.aivle.bookapp.dto.CreateBookCommand;
import com.aivle.bookapp.dto.UpdateBookCommand;
import com.aivle.bookapp.exception.BookNotFoundException;
import com.aivle.bookapp.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;

    // Service 내부에서 호출하는 용도
    private Book getRawBookById(Long id){
        return bookRepository.findById(id)
                .orElseThrow(() -> new BookNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public BookDto getBookById(Long id){
        return BookDto.from(getRawBookById(id));
    }

    @Transactional
    public BookDto createBook(CreateBookCommand command){
        return BookDto.from(
                bookRepository.save(command.toBook())
        );
    }

    @Transactional
    public BookDto updateBook(Long id, UpdateBookCommand command){
        Book existing = getRawBookById(id);

        existing.setTitle(command.title());
        existing.setAuthor(command.author());
        existing.setContent(command.content());
        existing.setCategory(command.category());
        existing.setCoverImageUrl(command.coverImageUrl());
        existing.setUpdatedAt(command.updatedAt());

        return BookDto.from(
                bookRepository.save(existing)
        );
    }

    @Transactional
    public void deleteBook(Long id){
        if(bookRepository.existsById(id)){
            bookRepository.deleteById(id);
        }else {
            throw new BookNotFoundException(id);
        }
    }

    @Transactional(readOnly = true)
    public List<BookDto> searchBooksFilter(String category, String searchType, String keyword) {

        String cleanCategory   = (category != null && !category.trim().isEmpty()) ? category.trim() : null;
        String cleanKeyword    = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        String cleanSearchType = (searchType != null && !searchType.trim().isEmpty()) ? searchType.trim().toLowerCase() : "total";

        // 1. 카테고리만 있는 경우
        if (cleanCategory != null && cleanKeyword == null) {
            return bookRepository.findByCategory(cleanCategory)
                    .stream()
                    .map(BookDto::from)
                    .collect(Collectors.toList());
        }

        // 2. 카테고리 + 검색어
        if (cleanCategory != null) {
            switch (cleanSearchType) {
                case "title":
                    return bookRepository.findByCategoryAndTitleContaining(cleanCategory, cleanKeyword)
                            .stream()
                            .map(BookDto::from)
                            .collect(Collectors.toList());
                case "author":
                    return bookRepository.findByCategoryAndAuthorContaining(cleanCategory, cleanKeyword)
                            .stream()
                            .map(BookDto::from)
                            .collect(Collectors.toList());
                default:
                    return bookRepository.findByCategoryAndSearchKeyword(cleanCategory, cleanKeyword)
                            .stream()
                            .map(BookDto::from)
                            .collect(Collectors.toList());
            }
        }

        // 3. 검색어만 있는 경우
        if (cleanKeyword != null) {
            switch (cleanSearchType) {
                case "title":
                    return bookRepository.findByTitleContaining(cleanKeyword)
                            .stream()
                            .map(BookDto::from)
                            .collect(Collectors.toList());
                case "author":
                    return bookRepository.findByAuthorContaining(cleanKeyword)
                            .stream()
                            .map(BookDto::from)
                            .collect(Collectors.toList());
                default:
                    return bookRepository.findBySearchKeyword(cleanKeyword)
                            .stream()
                            .map(BookDto::from)
                            .collect(Collectors.toList());
            }
        }

        // 4. 카테고리없고, 검색어도 없는 경우 -> 전체조회
        return bookRepository.findAll()
                .stream()
                .map(BookDto::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookDto updateCoverImageUrl(Long id, UpdateBookCommand command){
        Book book = getRawBookById(id);
        book.setCoverImageUrl(command.coverImageUrl());

        return BookDto.from(
                bookRepository.save(book)
        );
    }

    @Transactional
    public BookDto patchBook(Long id, UpdateBookCommand command){
        Book existing = getRawBookById(id);

        if(command.title() != null) existing.setTitle(command.title());
        if(command.author() != null) existing.setAuthor(command.author());
        if(command.content() != null) existing.setContent(command.content());
        if(command.category() != null) existing.setCategory(command.category());
        if(command.coverImageUrl() != null) existing.setCoverImageUrl(command.coverImageUrl());
        if(command.updatedAt() != null) existing.setUpdatedAt(command.updatedAt());

        return BookDto.from(bookRepository.save(existing));
    }

    @Value("${openai.api.url.summary:https://api.openai.com/v1/chat/completions}")
    private String summaryApiUrl;

    @Value("${openai.api.url.image:https://api.openai.com/v1/images/generations}")
    private String imageApiUrl;

    public String generateImageUrl(String title, String content, String model, String quality, String apiKey) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        // ── 1. 도서 내용 요약 (Summary API 호출) ───────────────────────────────
        String summaryText = content; // 기본값은 원본 내용 (요약 실패 시 대비)

        try {
            Map<String, Object> summaryRequest = new HashMap<>();
            summaryRequest.put("model", "gpt-4o-mini");
            summaryRequest.put("max_tokens", 300);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content",
                    "너는 도서 요약 전문가야. 제공된 책의 전체 내용을 바탕으로, 독자의 호기심을 자극할 수 있도록 줄거리를 요약해.\n" +
                            "[필수 조건]:\n" +
                            "1. 절대 결말이나 중요한 반전(스포일러)을 포함하지 마라.\n" +
                            "2. 책의 초중반부 설정과 호기심을 자극하는 분위기 위주로 작성해라.\n" +
                            "3. 핵심 키워드를 포함하여 딱 150자 내외의 짧은 분량으로 요약해라."
            ));
            messages.add(Map.of("role", "user", "content", content));

            summaryRequest.put("messages", messages);

            HttpEntity<Map<String, Object>> summaryEntity = new HttpEntity<>(summaryRequest, headers);
            ResponseEntity<Map> summaryResponse = restTemplate.postForEntity(summaryApiUrl, summaryEntity, Map.class);

            Map<String, Object> body = summaryResponse.getBody();
            if (body != null && body.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                summaryText = (String) message.get("content");
                System.out.println("✅ 도서 요약 성공: " + summaryText);
            }
        } catch (Exception e) {
            System.err.println("⚠️ 도서 요약 API 호출 실패 (원본 내용으로 대체됨): " + e.getMessage());
        }

        // ── 2. 표지 이미지 생성 (Image API 호출) ──────────────────────────────
        String prompt = """
            A full-frame, 2D flat graphic vector and illustration design for a front book cover.
            
            The book title is "${title}".
            
            The core illustration should represent the following story and mood, completely filling the entire canvas up to the edges: ${content}.
            
            [Layout & Composition instructions]: 
            - Full-bleed design: The artistic illustration must completely fill the entire background space with NO borders, NO mockups, NO 3D book shapes, and NO realistic textures.
            - Flat 2D front-view aspect only. It must look like a digital graphic design file, not a photo of a physical book.
            - The title "${title}" must be typed cleanly on the cover using medium, highly legible, well-placed typography that harmonizes with the background illustration.
            
            [Style instructions]: Modern minimalist graphic design, award-winning book illustration, artistic, high resolution, clean layout.
            [Crucial]: DO NOT include any 3D book spine, pages, folds, shadows, or background scenery behind the book. DO NOT write any other text except the title."""
                .replace("${title}", title)
                .replace("${content}", summaryText);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("prompt", prompt);
        requestBody.put("n", 1);
        requestBody.put("quality", quality);
        requestBody.put("output_format", "png");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(imageApiUrl, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("data")) {
                List<Map<String, Object>> dataList = (List<Map<String, Object>>) responseBody.get("data");
                return (String) dataList.get(0).get("b64_json");
            }
            throw new RuntimeException("OpenAI API 응답에 이미지 데이터가 없습니다.");
        } catch (Exception e) {
            throw new RuntimeException("이미지 생성 실패: " + e.getMessage());
        }
    }
}
