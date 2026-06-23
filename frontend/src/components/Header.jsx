import { Link, useLocation } from 'react-router-dom';

function Header() {
  // 스타일은 App.css의 .site-header / .nav-btn 클래스로 분리
  // 현재 페이지인 버튼은 'active' 클래스로 하이라이트(진한 파란색) 처리
  const location = useLocation();

  return (
    <header className="site-header">
      {/* 로고 영역: 클릭 시 규칙대로 메인 목록으로 전환 */}
      <h2 className="header-logo">
        <Link to="/">📘 도서 관리 시스템</Link>
      </h2>

      <nav className="header-nav">
        <Link
          className={`nav-btn${location.pathname === '/' ? ' active' : ''}`}
          to="/"
        >
          도서 목록
        </Link>


        <Link
          className={`nav-btn nav-btn-add${location.pathname === '/books/new' ? ' active' : ''}`}
          to="/books/new"
        >
          새 도서 등록
        </Link>
      </nav>
    </header>
  );
}

export default Header;
