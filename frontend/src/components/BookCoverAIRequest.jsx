import { useState } from "react";

function BookCoverAIRequest({ book, onFieldChange }) {
    const [userApiKey, setUserApiKey] = useState("");
    const [selectedModel, setSelectedModel] = useState("gpt-image-2");
    const [selectedQuality, setSelectedQuality] = useState("medium");
    const [loading, setLoading] = useState(false);

async function handleGenerateCover() {
        if (!userApiKey) {
            alert("API Key를 입력해주세요.");
            return;
        }

        if (!book.title || !book.content) {
            alert("표지를 생성하려면 도서명과 도서 내용을 먼저 입력해주세요.");
            return;
        }

        const isConfirmed = window.confirm(
            "AI 표지 생성 비용 안내\n\n이미지를 생성할 때마다 API Key의 비용이 실제로 차감됩니다.\n정말 생성을 진행하시겠습니까?"
        );

        if (!isConfirmed) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/books/generate-cover`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-OpenAI-Key": userApiKey,
                },
                body: JSON.stringify({
                    title: book.title,
                    content: book.content,
                    model: selectedModel,
                    quality: selectedQuality
                })
            });

            if (response.status === 401) {
                alert("인증 실패: 입력하신 OpenAI API Key가 올바른지 확인해주세요.");
                return;
            }

            if (response.status === 429) {
                alert("요청 한도 초과: 잠시 후 다시 시도해주세요.");
                return;
            }

            if (!response.ok) {
                alert(`요청 실패 (HTTP ${response.status})\n잠시 후 다시 시도해주세요.`);
                return;
            }

            const data = await response.json();

            if (data.coverImageUrl) {
                onFieldChange({
                    ...book,
                    coverImageUrl: data.coverImageUrl
                });
                alert("표지 생성 완료!");
            } else {
                alert("응답은 성공했지만 이미지 데이터를 찾을 수 없습니다.");
            }

        } catch (error) {
            console.error("표지 생성 중 에러:", error);
            alert("서버와 통신하는 중 네트워크 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="ai-cover-card">
            <div className="ai-cover-header">
                <h3>✨ AI 표지 생성기</h3>
                <p className="ai-cover-description">
                    작성한 도서의 제목과 내용을 바탕으로 인공지능이 새로운 표지를 생성합니다. 생성 기능을 사용하려면 유효한 API 키가 필요합니다.
                </p>
            </div>

            <div className="container">
                <div className="input-side">
                    <div>
                        <label>OpenAI API Key *</label>
                        <input
                            type="password"
                            placeholder="sk-..."
                            value={userApiKey}
                            onChange={(e) => setUserApiKey(e.target.value)}
                        />
                        <span>입력된 키는 서버에 저장되지 않으며 1회 생성에만 사용됩니다.</span>
                    </div>

                    <div className="options">
                        <div>
                            <label>생성 모델</label>
                            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                                <option value="gpt-image-2">GPT Image 2</option>
                            </select>
                        </div>
                        <div>
                            <label>품질</label>
                            <select value={selectedQuality} onChange={(e) => setSelectedQuality(e.target.value)}>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>


                    <button
                        type="button"
                        onClick={handleGenerateCover}
                        disabled={loading}
                    >
                        {loading ? "생성 중..." : "✨ AI 표지 생성"}
                    </button>
                </div>

                <div className="preview-side">
                    {book.coverImageUrl ? (
                        <img src={book.coverImageUrl} alt="생성된 표지" />
                    ) : (
                        <div>
                            <p>🖼️</p>
                            <p>생성된 표지가 여기에 표시됩니다</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default BookCoverAIRequest;