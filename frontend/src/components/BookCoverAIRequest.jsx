import { useState } from "react";

function BookCoverAIRequest({ book, onFieldChange }) {
    const OPENAPI_SUMMARY_API_URL = "https://api.openai.com/v1/chat/completions";
    const OPENAI_IMAGE_API_URL = "https://api.openai.com/v1/images/generations";
    
    // UI 입력값 상태 관리
    const [userApiKey, setUserApiKey] = useState("");
    const [selectedModel, setSelectedModel] = useState("gpt-image-2");
    const [selectedQuality, setSelectedQuality] = useState("medium");
    const [loading, setLoading] = useState(false);

    const createBookCoverPrompt = (title, content) => {
        return `A full-frame, 2D flat graphic vector and illustration design for a front book cover.
        The book title is "${title}".
        The core illustration should represent the following story and mood, completely filling the entire canvas up to the edges: ${content}.

        [Layout & Composition instructions]: 
        - Full-bleed design: The artistic illustration must completely fill the entire background space with NO borders, NO mockups, NO 3D book shapes, and NO realistic textures.
        - Flat 2D front-view aspect only. It must look like a digital graphic design file, not a photo of a physical book.
        - The title "${title}" must be typed cleanly on the cover using medium, highly legible, well-placed typography that harmonizes with the background illustration.

        [Style instructions]: Modern minimalist graphic design, award-winning book illustration, artistic, high resolution, clean layout.
        [Crucial]: DO NOT include any 3D book spine, pages, folds, shadows, or background scenery behind the book. DO NOT write any other text except the title.`;
    }

    // HTTP 상태 코드별 사용자 안내 문구 생성 (401/429/기타)
    const buildHttpErrorMessage = (status, contextLabel) => {
        if (status === 401) {
            return `[${contextLabel}] 인증 실패 (401 Unauthorized)\n입력하신 OpenAI API Key가 올바른지 확인해주세요.`;
        }
        if (status === 429) {
            return `[${contextLabel}] 요청 한도 초과 (429 Rate Limit)\n잠시 후 다시 시도해주세요.`;
        }
        return `[${contextLabel}] 요청 실패 (HTTP ${status})\n잠시 후 다시 시도해주세요.`;
    };

    // 응답 JSON 파싱 (실패 시 사용자 안내 후 null 반환)
    const safeParseJson = async (response, contextLabel) => {
        try {
            return await response.json();
        } catch (e) {
            console.error(`[${contextLabel}] JSON 파싱 실패:`, e);
            alert(`[${contextLabel}] 응답 형식이 올바르지 않습니다.\n잠시 후 다시 시도해주세요.`);
            return null;
        }
    };

    async function handleGenerateCover() {
        if (!userApiKey) {
            alert("API Key를 입력해주세요.");
            return;
        }

        if (!book.content || !book.content.trim()) {
            alert("책 내용이 비어있어 요약 및 표지를 생성할 수 없습니다. \n내용을 먼저 입력해 주세요.");
            return;
        }

        const isConfirmed = window.confirm(
            "AI 표지 생성 비용 안내\n\n이미지를 생성할 때마다 API Key의 비용이 실제로 차감됩니다.\n정말 생성을 진행하시겠습니까?"
        );

        if (!isConfirmed) return;

        setLoading(true);
        try {
            // ── 1. 도서 내용 요약 ───────────────────────────────
            const summaryRes = await fetch(OPENAPI_SUMMARY_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userApiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: `너는 도서 요약 전문가야.
                            제공된 책의 전체 내용을 바탕으로, 독자의 호기심을 자극할 수 있도록 줄거리를 요약해.

                            [필수 조건]:
                            1. 절대 결말이나 중요한 반전(스포일러)을 포함하지 마라.
                            2. 책의 초중반부 설정과 호기심을 자극하는 분위기 위주로 작성해라.
                            3. 핵심 키워드를 포함하여 딱 150자 내외의 짧은 분량으로 요약해라.`
                        },
                        {
                            role: "user",
                            content: book.content
                        }
                    ], max_tokens: 300
                })
            });

            // 상태 코드별 분기 (401: API Key 확인 유도, 429: 잠시 후 재시도, 그 외: 일반 실패)
            if (!summaryRes.ok) {
                alert(buildHttpErrorMessage(summaryRes.status, '도서 요약'));
                return;
            }

            // 응답 JSON 파싱 (예상과 다른 형식이면 안내 후 종료)
            const summaryData = await safeParseJson(summaryRes, '도서 요약');
            if (!summaryData) return;

            const cleanSummary = summaryData.choices?.[0]?.message?.content;
            if (!cleanSummary) {
                alert('[도서 요약] 응답에서 요약 내용을 찾지 못했습니다.\n잠시 후 다시 시도해주세요.');
                return;
            }

            // ── 2. 표지 이미지 생성 ──────────────────────────────
            const res = await fetch(OPENAI_IMAGE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userApiKey}`,
                },
                body: JSON.stringify({
                    model: selectedModel,
                    prompt: createBookCoverPrompt(book.title, cleanSummary),
                    n: 1,
                    size: '1024x1536',
                    quality: selectedQuality,
                    output_format: 'png',
                }),
            });

            if (!res.ok) {
                alert(buildHttpErrorMessage(res.status, '표지 이미지 생성'));
                return;
            }

            const data = await safeParseJson(res, '표지 이미지 생성');
            if (!data) return;

            const b64Json = data.data?.[0]?.b64_json;
            if (!b64Json) {
                alert('[표지 이미지 생성] 응답에서 이미지 데이터를 찾지 못했습니다.\n잠시 후 다시 시도해주세요.');
                return;
            }

            // b64_json을 Data URL 형태로 변환 + 화면 반영
            const imageSrc = `data:image/png;base64,${b64Json}`;
            onFieldChange({
                ...book,
                coverImageUrl: imageSrc
            });
            alert("표지 생성 완료");

        } catch (error) {
            console.error(error);
            // fetch 자체가 실패한 경우 (네트워크 단절·CORS 등) → TypeError
            if (error instanceof TypeError) {
                alert("네트워크 오류가 발생했습니다.\n인터넷 연결 상태를 확인한 뒤 다시 시도해주세요.");
            } else {
                alert(`처리 중 오류가 발생했습니다.\n${error.message ?? ''}`);
            }
        } finally {
            setLoading(false);
        }
    }

return (
        <section className="ai-cover-card">
            {/* 제목 및 설명 */}
            <div className="ai-cover-header">
                <h3>✨ AI 표지 생성기</h3>
                <p className="ai-cover-description">
                    작성한 도서의 제목과 내용을 바탕으로 인공지능이 새로운 표지를 생성합니다.
                    생성 기능을 사용하려면 유효한 API 키가 필요합니다.
                </p>
            </div>

            <div className="container">
                <div className="input-side">
                    {/* API Key 입력 섹션 */}
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

                    {/* 모델 및 품질 선택 섹션 */}
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

                    {/* 생성 버튼 */}
                    <button 
                        type="button"
                        onClick={handleGenerateCover} 
                        disabled={loading}
                    >
                        {loading ? "생성 중..." : "✨ AI 표지 생성"}
                    </button>
                </div>

                {/* 미리보기 영역 */}
                <div className="preview-side">
                    {book.coverImageUrl ? (<img src={book.coverImageUrl} alt="생성된 표지" />) : (
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