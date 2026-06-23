import { CATEGORY_OPTIONS } from '../constants/categoryOptions';

const TITLE_MAX_LENGTH = 50;
const AUTHOR_MAX_LENGTH = 30;
const CONTENT_MAX_LENGTH = 500;

function BookForm({ book, onFieldChange }) {
    const handleChange = (field) => (e) => {
        const value = e.target.value;
        const nextValue = field === 'title' || field === 'author'
            ? value.trimStart()
            : value;

        onFieldChange({
            ...book,
            [field]: nextValue
        });
    };

    const handleBlur = (field) => () => {
        const value = book[field] ?? '';
        const trimmedValue = value.trim();

        if (value === trimmedValue) return;

        onFieldChange({
            ...book,
            [field]: trimmedValue
        });
    };

    return (
        <div className="book-form-card">
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">도서명<span className="required">*</span></label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="도서명을 입력하세요"
                        value={book.title}
                        onChange={handleChange('title')}
                        onBlur={handleBlur('title')}
                        maxLength={TITLE_MAX_LENGTH}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">저자<span className="required">*</span></label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="저자를 입력하세요"
                        value={book.author}
                        onChange={handleChange('author')}
                        onBlur={handleBlur('author')}
                        maxLength={AUTHOR_MAX_LENGTH}
                        required
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">카테고리<span className="required">*</span></label>
                <select
                    className="form-input"
                    value={book.category ?? ''}
                    onChange={handleChange('category')}
                    required
                >
                    <option value="">카테고리를 선택하세요</option>
                    {CATEGORY_OPTIONS.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">도서 내용</label>
                <textarea
                    className="form-input form-textarea"
                    placeholder="도서의 내용을 작성하세요"
                    value={book.content}
                    onChange={handleChange('content')}
                    onBlur={handleBlur('content')}
                    maxLength={CONTENT_MAX_LENGTH}
                />
                <p className="form-counter">
                    {(book.content ?? '').length}/{CONTENT_MAX_LENGTH}
                </p>
            </div>
        </div>
    );
}

export default BookForm;
