import { useNavigate } from 'react-router-dom';
import { CATEGORY_OPTIONS } from '../constants/categoryOptions';
import '../App.css';


function BookItem({ id, title, author, category, coverImageUrl, createdAt, updatedAt }) {
    const navigate = useNavigate();
    // 목록에서 삭제
    const handleDeleteClick = (e) => {
        e.stopPropagation();
        navigate(`/books/${id}/delete`);
    }

    // 날짜 표시 보정: ISO("2023-01-01T00:00:00Z")이든 toLocaleString 결과이든 YYYY-MM-DD로 통일
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr; // 파싱 실패 시 원본 그대로
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    // 카테고리 → 배지 색상 클래스 (CATEGORIES 배열 내 index 기반)
    const categoryIndex = CATEGORY_OPTIONS.indexOf(category);
    const categoryBadgeClass = categoryIndex >= 0
        ? `book-category-badge book-category-badge--${categoryIndex}`
        : 'book-category-badge book-category-badge--unknown';

  return (
    <li className="book-card"
        onClick={() => navigate(`/books/${id}`)} // 버튼X, 카드 어디든 누르면 상세보기로 이동
    >
        <div className="book-image">
            {coverImageUrl && (
            <img src={coverImageUrl} alt={title} />
            )}
        </div>

        <div className="book-info">
            {category && (
                <span className={categoryBadgeClass}>{category}</span>
            )}
            <h3>{title}</h3>
            <p className="book-author">{author}</p>

            <hr className="book-divider" />

            {/* 등록일과 수정일을 라벨/값 형태로 표시 (디자인 샘플 기준) */}
            <div className="book-dates">
                <div className="book-date-row">
                    <span className="book-date-label">등록일</span>
                    <span className="book-date-value">{formatDate(createdAt)}</span>
                </div>
                {updatedAt && (
                    <div className="book-date-row">
                        <span className="book-date-label">수정일</span>
                        <span className="book-date-value">{formatDate(updatedAt)}</span>
                    </div>
                )}
            </div>
        </div>

        <div className="book-actions">
            <button className="delete-btn" onClick={handleDeleteClick}>삭제</button>
        </div>
    </li>
  );
}

export default BookItem;
