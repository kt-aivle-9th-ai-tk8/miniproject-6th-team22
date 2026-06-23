package com.aivle.bookapp.repository;

import com.aivle.bookapp.domain.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    // category 비명시
    List<Book> findByTitleContaining(String title);
    List<Book> findByAuthorContaining(String author);
    default List<Book> findBySearchKeyword(String keyword) {
        return findByTitleContainingOrAuthorContaining(keyword, keyword);
    }
    // category 명시
    List<Book> findByCategory(String category);
    List<Book> findByCategoryAndTitleContaining(String category, String title);
    List<Book> findByCategoryAndAuthorContaining(String category, String author);
    default List<Book> findByCategoryAndSearchKeyword(String category, String keyword) {
        return findByCategoryAndTitleContainingOrCategoryAndAuthorContaining(category, keyword, category, keyword);
    }

    // 아래 메서드는 직접 호출하여 사용하는 것을 권장하지 않음 (과도하게 복잡함) --> 위에 `default`로 정의해놓은 메서드 사용
    List<Book> findByTitleContainingOrAuthorContaining(String title, String author);
    List<Book> findByCategoryAndTitleContainingOrCategoryAndAuthorContaining(String category1, String title, String category2, String author);
}
