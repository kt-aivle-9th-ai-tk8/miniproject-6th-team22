import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// 기존 AI 생성기 컴포넌트 그대로 사용 (수정 불필요)
import BookCoverAIRequest from "./BookCoverAIRequest"; 

export default function ViewBook({ books, onUpdateCover }) {
  const { id } = useParams();
  const book = books.find(b => b.id === Number(id));

  const [isAiMode, setIsAiMode] = useState(false); 
  const [isPatching, setIsPatching] = useState(false); 

  // 상세 페이지 전용 디자인 프롬프트 작성 위한 것
  const [tempContent, setTempContent] = useState("");

  const navigate = useNavigate();

  if (!book) {
    navigate('/error/not-found');
    return null;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  const handleAiCoverGenerated = async (updatedBookWithImage) => {
    setIsPatching(true);

    const success = await onUpdateCover(book.id, updatedBookWithImage);
    
    if (success) {
      setIsAiMode(false); // 성공하면 입력창 닫기
    }
    setIsPatching(false);
  };

  // 원래 book 정보에 사용자가 새로 쓴 tempContent만 덮어씌운 가짜 객체를 만들기
  const modifiedBookForAi = {
    ...book,
    content: tempContent.trim() ? tempContent : `도서 제목: "${book.title}". 줄거리 및 분위기: ${book.content}`
  };

  return (
    <div className="viewbook-container">
      <div className="viewbook-header-bar">
        <button className="btn-secondary" onClick={() => navigate('/')} disabled={isPatching}>목록으로 돌아가기</button>
      </div>

      <h1 className="viewbook-page-title">도서 상세 정보</h1>

      <div className="viewbook-card">
        <div className="viewbook-cover-wrapper">
          {book.coverImageUrl ? (
            <img src={book.coverImageUrl} alt={book.title} />
          ) : (
            <span className="no-cover-image">이미지 없음</span>
          )}
          {isPatching && <div className="cover-loading-overlay">저장 중...</div>}
        </div>

        <div className="viewbook-info">
          <h2 className="viewbook-title">{book.title}</h2>
          <p className="viewbook-author">{book.author} 저</p>
          
          <div className="viewbook-details-grid">
            <p className="viewbook-details-item" >등록일: {formatDate(book.createdAt)}</p>
            <p className="viewbook-details-item">수정일: {formatDate(book.updatedAt)}</p>
          </div>
          
          <h3 className="viewbook-content-title">도서 소개</h3>
          <p className="viewbook-content-body">{book.content}</p>

          <div className="viewbook-action">
            <button className="btn-danger" onClick={() => navigate(`/books/${book.id}/delete`)} disabled={isPatching}>도서삭제</button>
            
            <button 
              className="btn-ai-toggle" 
              onClick={() => setIsAiMode(!isAiMode)} 
              disabled={isPatching}
            >
              {isAiMode ? "표지 생성 취소" : "AI 표지 변경"}
            </button>

            <button className="btn-primary" onClick={() => navigate(`/books/${book.id}/edit`)} disabled={isPatching}>정보 수정</button>
          </div>
          {/* 상세 페이지 토글 영역에만 텍스트 입력창과 AI 컴포넌트를 나란히 배치 */}
          {isAiMode && (
            <div className="viewbook-ai-request-wrapper">
              
              {/* 상세페이지 전용 피드백 입력란 */}
              <div className="viewbook-textarea-group">
                <label className="viewbook-textarea-label">표지 수정을 위한 디자인 프롬프트 작성</label>
                <textarea
                  className="viewbook-feedback-textarea"
                  rows="4"
                  value={tempContent}
                  onChange={(e) => setTempContent(e.target.value)}
                  disabled={isPatching}
                  placeholder="원하는 프롬프트를 입력하면 새로운 표지를 그려냅니다. 미입력 시 책 제목과 내용을 기반으로 표지는 랜덤 생성됩니다."
                />
              </div>

              {/* 기존 AI 컴포넌트 호출 */}
              <BookCoverAIRequest 
                book={modifiedBookForAi} 
                onFieldChange={handleAiCoverGenerated} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}