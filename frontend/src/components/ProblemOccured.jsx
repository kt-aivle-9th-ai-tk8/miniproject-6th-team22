import { useNavigate } from 'react-router-dom';

function ProblemOccured() {
    const navigate = useNavigate();

    return (
        <div className="unavailable">
            <h2>문제가 발생했습니다.</h2>
            <p>죄송합니다. 요청하신 작업을 처리하는 중에 문제가 발생했습니다.</p>
            <button onClick={() => navigate('/')}>목록으로 돌아가기</button>
        </div>
    );
}

export default ProblemOccured;