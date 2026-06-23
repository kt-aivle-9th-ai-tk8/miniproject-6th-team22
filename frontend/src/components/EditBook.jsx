import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BookForm from "./BookForm";
import BookCoverAIRequest from "./BookCoverAIRequest";

// App.jsx 하위 부모 컴포넌트 - 책 내용 수정 페이지
function EditBook({ onRevise, books }) {
    const { id } = useParams();
    const book = books.find(b => b.id === Number(id));
    const navigate = useNavigate();

    // book 데이터 없을 때
    if (book === null || book === undefined) {
        navigate('/error/not-found');
        return null;
    }

    const [newBook, setNewBook] = useState({
        id: book.id,
        title: book.title,
        author: book.author,
        content: book.content,
        category: book.category,
        coverImageUrl: book.coverImageUrl,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt
    });

    const handleFieldChange = (updatedBook) => {
        setNewBook(updatedBook);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newBook.title || !newBook.author) {
            alert("제목과 저자는 필수 입력 사항입니다.");
            return;
        }
        if (!newBook.category) {
            alert("카테고리는 필수 선택 사항입니다.");
            return;
        }
        onRevise(book.id, newBook);
    };

    return (
        <div className="form-page-container">
            <h1>책 내용 수정</h1>
            <BookForm
                book={newBook}
                onFieldChange={handleFieldChange}
            />
            <BookCoverAIRequest book={newBook} onFieldChange={handleFieldChange} />
            <div className="button-group">
                <button type="button" onClick={handleSubmit} className="submit-button">
                    등록
                </button>
                <button type="button" onClick={() => navigate(-1)} className="cancel-button">
                    취소
                </button>
            </div>
        </div>
    );
}

export default EditBook;