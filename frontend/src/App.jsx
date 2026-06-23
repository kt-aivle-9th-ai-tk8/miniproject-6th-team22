import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import BookList from './components/BookList';
import AddBook from './components/AddBook';
import EditBook from './components/EditBook';
import ViewBook from './components/ViewBook';
import RemoveBook from './components/RemoveBook';
import UnavailableBook from './components/UnavailableBook';
import UnavailableBackend from './components/UnavailableBackend';
import ProblemOccured from './components/ProblemOccured';
function App() {
  const navigate = useNavigate();

  // 1. 상태(State) 관리
  const [books, setBooks] = useState([]); // 전체 도서 목록 상태
  const [serverError, setServerError] = useState(false); // 백엔드 연결 실패 상태

  // 백엔드 데이터베이스 연결 주소
  const API_URL = 'http://localhost:8080/books';

  const runBookRequest = async (request, { errorMessage } = {}) => {
    try {
      const response = await request();

      if (response.ok) {
        // Some responses may have an empty body even with 2xx; content-length may be unavailable in browsers.

        const text = await response.text();

        if (!text) {

          return { success: true, status: response.status, data: null };
        }

        try {
          const data = JSON.parse(text);
          return { success: true, status: response.status, data };
        } catch (error) {
          console.error('JSON 파싱 실패:', error);
          return { success: false, status: response.status, errorType: 'PARSE_ERROR', error, data: null };
        }
      }

      let errorBody = null;
      try {
        errorBody = await response.json();
      } catch {
        try {
          errorBody = await response.text();
        } catch {}
      }
      return { success: false, status: response.status, errorType: response.status >= 500 ? 'SERVER_ERROR' : 'CLIENT_ERROR', error: errorBody };
    } catch (error) {
      if (errorMessage) {
        console.error(errorMessage, error);
      }
      return { success: false, status: null, errorType: 'NETWORK_ERROR', error };
    }
  };

  // 2. 초기 데이터 로드 (fetch + GET)
  useEffect(() => {
    fetchBooks(); // 처음 켰을 때는 빈 조건으로 전체 목록 조회
  }, []);

  const fetchBooks = async (filterData = null) => {
    let url = API_URL;


    if (filterData) {
      const { category, searchType, keyword } = filterData;
      // 예: http://localhost:8080/books?category=소설&searchType=title&keyword=자바
      url = `${API_URL}?category=${encodeURIComponent(category)}&searchType=${encodeURIComponent(searchType)}&keyword=${encodeURIComponent(keyword)}`;
    }

    const booksResponse = await runBookRequest(
      () => fetch(url),
      {
        errorMessage: '도서 목록을 불러오는 중 오류 발생:',
      }
    );

    if (booksResponse.success) {
      setBooks(Array.isArray(booksResponse.data) ? booksResponse.data : []);
    } else {
      if (booksResponse.errorType === 'NETWORK_ERROR' || booksResponse.errorType === 'SERVER_ERROR') {
        setServerError(true);
      } else {
        navigate('/error');
      }
    }
  };

  // AI 표지가 성공적으로 생성되었을 때 호출되는 백엔드 PATCH 콜백
  const handleUpdateCoverApi = async (bookId, updatedBookWithImage) => {
    const coverResponse = await runBookRequest(
      () => fetch(`${API_URL}/${bookId}/cover`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverImageUrl: updatedBookWithImage.coverImageUrl,
        }),
      }),
      { errorMessage: 'PATCH 요청 중 오류 발생:' }
    );

    if (coverResponse.success) {
      const finalBook = coverResponse.data; 
      alert("생성된 AI 표지가 최종 반영되었습니다!");
      setBooks(prevBooks => prevBooks.map(b => b.id === finalBook.id ? finalBook : b));
      navigate('/');
      return true;
    } else {
      if (coverResponse.errorType === 'NETWORK_ERROR' || coverResponse.errorType === 'SERVER_ERROR') {
        setServerError(true);
      } else if (coverResponse.status === 404) {
        navigate('/error/not-found');
      } else {
        navigate('/error');
      }

      alert("표지를 저장하는 데 실패했습니다.");
      return false;
    }
  };

  // 4. CRUD 비즈니스 로직 핸들러

  // 신규 도서 등록 (onSubmit) post
  const handleSubmit = async (bookObject) => {
    const currentTime = new Date().toISOString();
    const bookWithTimestamps = {
      ...bookObject,
      createdAt: currentTime,
      updatedAt: currentTime
    };

    const newBookResponse = await runBookRequest(
      () => fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookWithTimestamps),
      }),
      { errorMessage: '도서 등록 실패:' }
    );

    if (newBookResponse.success) {
      setBooks(prevBooks => [...prevBooks, newBookResponse.data]);
      navigate(`/books/${newBookResponse.data.id}`);
    } else {
      if (newBookResponse.errorType === 'NETWORK_ERROR' || newBookResponse.errorType === 'SERVER_ERROR') {
        setServerError(true);
      } else {
        navigate('/error');
      }
    }
  };

  // 기존 도서 수정 (onRevise) update(patch)
  const handleRevise = async (bookId, bookObject) => {
    const currentTime = new Date().toISOString();
    const bookWithTimestamps = {
      ...bookObject,
      updatedAt: currentTime
    };

    const revisedBookResponse = await runBookRequest(
      () => fetch(`${API_URL}/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookWithTimestamps),
      }),
      { errorMessage: '도서 수정 실패:' }
    );

    if (revisedBookResponse.success) {
      setBooks(prevBooks => prevBooks.map(book => book.id === bookId ? revisedBookResponse.data : book));
      navigate(`/books/${revisedBookResponse.data.id}`);
    } else {
      if (revisedBookResponse.errorType === 'NETWORK_ERROR' || revisedBookResponse.errorType === 'SERVER_ERROR') {
        setServerError(true);
      } else if (revisedBookResponse.status === 404) {
        navigate('/error/not-found');
      } else {
        navigate('/error');
      }
    }
  };

  // 특정 도서 삭제 (onDelete) delete
  const handleDelete = async (bookId) => {
    const deleted = await runBookRequest(
      () => fetch(`${API_URL}/${bookId}`, {
        method: 'DELETE',
      }),
      { errorMessage: '도서 삭제 실패:' }
    );

    if (deleted.success) {
      setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
      navigate('/');
    } else {
      if (deleted.errorType === 'NETWORK_ERROR' || deleted.errorType === 'SERVER_ERROR') {
        setServerError(true);
      } else if (deleted.status === 404) {
        navigate('/error/not-found');
      } else {
        navigate('/error');
      }
    }
  };

  return (
    <div className="app-container">
      <Header />
      {serverError && <UnavailableBackend onRetry={() => { setServerError(false); fetchBooks(); }} />}

      <main className="main-content">
        <Routes>
          <Route path="/" element={
            <BookList
              books={books}
              onSearch={fetchBooks}
            />
          } />
          <Route path="/books/new" element={
            <AddBook
              onSubmit={handleSubmit}
            />
          } />
          <Route path="/books/:id" element={
            <ViewBook
              books={books}
              onUpdateCover={handleUpdateCoverApi}
            />
          } />
          <Route path="/books/:id/edit" element={
            <EditBook
              books={books}
              onRevise={handleRevise}
            />
          } />
          <Route path="/books/:id/delete" element={
            <RemoveBook
              books={books}
              onDelete={handleDelete}
            />
          } />
          <Route path="/error/not-found" element={<UnavailableBook />} />
          <Route path="/error" element={<ProblemOccured />} />
          <Route path="*" element={<UnavailableBook />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
