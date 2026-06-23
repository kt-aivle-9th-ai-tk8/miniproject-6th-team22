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

import java.util.List;
import java.util.stream.Collectors;

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
}
