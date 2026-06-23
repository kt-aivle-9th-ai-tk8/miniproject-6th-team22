function UnavailableBackend({ onRetry }) {
    return (
        <div className="unavailable-overlay">
            <div className="unavailable-dialog">
                <h2>백엔드 서비스를 사용할 수 없습니다.</h2>
                <p>현재 백엔드 서비스가 사용 불가능합니다.<br />잠시 후 다시 시도해주세요.</p>
                <button onClick={onRetry}>다시 시도</button>
            </div>
        </div>
    );
}

export default UnavailableBackend;