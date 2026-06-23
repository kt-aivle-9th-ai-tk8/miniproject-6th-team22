import { useNavigate } from 'react-router-dom';

function UnavailableBook() {
    const navigate = useNavigate();

    return (
        <div className="unavailable">
            <h2>도서를 찾을 수 없습니다.</h2>
            <p>요청하신 페이지의 도서는 존재하지 않습니다.</p>
            <button onClick={() => navigate('/')}>도서 목록으로 돌아가기</button>
        </div>
    );
}

export default UnavailableBook;