
# 📚 AI 기반 감성 창작 도서 관리 시스템 (Team 21)

> **KT AIVLE School 9th Mini-Project 5th**  
> 본 프로젝트는 사용자가 작성한 글의 제목과 본문 내용을 분석하여  
> OpenAI GPT Image 모델을 통해 세상에 단 하나뿐인 감성 도서 표지를 자동 생성하는 스마트 창작 플랫폼입니다.  
> 이때, *Spring Framework*를 기반으로 한 REST API 서버를 활용하여 도서 데이터의 조회, 생성, 수정, 삭제(CRUD) 기능을 제공합니다.

---

# 🛠️ 기술 구조

## 기술 스택

| 구분             | 기술                                                                 |
|----------------|--------------------------------------------------------------------|
| Language       | Java 17                                                            |
| Framework      | Spring Boot 4.0.6 (Spring Web MVC)                                 |
| Persistence    | Spring Data JPA, Hibernate                                         |
| Database       | H2 (In-Memory, `jdbc:h2:mem:bookdb`)                               |
| Validation     | Spring Boot Starter Validation (`@Valid`, `@NotBlank`)            |
| API Docs       | SpringDoc OpenAPI (Swagger UI)                                     |
| Productivity   | Lombok, Spring Boot DevTools                                       |
| Build Tool     | Gradle                                                             |
| AI             | OpenAI GPT Image (도서 표지 자동 생성)                                |

## 레이어드 아키텍처

본 프로젝트는 관심사 분리를 위해 계층형(Layered) 아키텍처로 설계되었습니다.

```text
Client (React)
      │  HTTP / JSON
      ▼
┌─────────────────────────────────────────────┐
│  Controller   (BookController)               │  ← REST 엔드포인트, 요청/응답 매핑, @Valid 검증
├─────────────────────────────────────────────┤
│  Service      (BookService)                  │  ← 비즈니스 로직, @Transactional
├─────────────────────────────────────────────┤
│  Repository   (BookRepository)               │  ← Spring Data JPA, 데이터 접근
├─────────────────────────────────────────────┤
│  Domain       (Book Entity)                  │  ← JPA 엔티티, 도메인 모델
└─────────────────────────────────────────────┘
      │
      ▼
   H2 Database (In-Memory)

전역 처리
 - WebConfig             : CORS 설정
 - GlobalExceptionHandler: @RestControllerAdvice 기반 전역 예외 처리
 - DTO / Command         : 계층 간 데이터 전달 및 요청·응답 분리
```

## 프로젝트 구조

```text
src/main/java/com/aivle/bookapp
├── BookappApplication.java          # 애플리케이션 진입점
├── config
│   └── WebConfig.java               # CORS 등 웹 설정
├── controller
│   └── BookController.java          # REST API 엔드포인트
├── service
│   └── BookService.java             # 비즈니스 로직
├── repository
│   └── BookRepository.java          # JPA 데이터 접근 계층
├── domain
│   └── Book.java                    # JPA 엔티티
├── dto                              # 요청/응답 및 Command 객체
│   ├── BookDto.java
│   ├── BookResponse.java
│   ├── CreateBookCommand.java
│   ├── UpdateBookCommand.java
│   ├── UpdateBookCoverImageUrlCommand.java
│   ├── PostBookRequest.java
│   ├── PutBookRequest.java
│   ├── PatchBookRequest.java
│   └── PatchBookCoverImageUrlRequest.java
└── exception                        # 예외 처리
    ├── BookNotFoundException.java
    ├── ErrorResponse.java
    └── GlobalExceptionHandler.java
```

---

# 📊 데이터 모델 정의

| 필드명             | 데이터 타입 | 설명                  |
|-----------------|--------|---------------------|
| [PK] `id`       | Long   | 고유 식별자              |
| `title`         | String | 도서 제목               |
| `author`        | String | 도서 저자               |
| `category`      | String | 도서 분류               |
| `content`       | String | 도서 소개 및 본문          |
| `coverImageUrl` | String | Base64 이미지 Data URL |
| `createdAt`     | String | 생성 시각 (ISO 8601)    |
| `updatedAt`     | String | 수정 시각 (ISO 8601)    |

---

# 🔌 API Specification

Base URL:

```text
http://localhost:8080
```

---

## 📝 API 요약

| 기능         | Method | Endpoint           | 쿼리 파라미터                       |
|------------|--------|--------------------|-------------------------------|
| 도서 목록 조회   | GET    | `/books`           | category, searchType, keyword |
| 도서 상세 조회   | GET    | `/books/:id`       |                               |
| 신규 도서 등록   | POST   | `/books`           |                               |
| 도서 정보 수정   | PUT    | `/books/:id`       |                               |
| 도서 정보 삭제   | DELETE | `/books/:id`       |                               |
| 도서 AI표지 갱신 | PATCH  | `/books/:id/cover` |                               |
| 도서 정보 부분수정 | PATCH  | `/books/:id`       |                               |

---

# 🔍 API 요청 / 응답 테스트 결과

> API 명세 및 API 테스트는 Swagger-UI를 통해 쉽고 간편하게 확인 가능하도록 했습니다. 서버 실행 후 아래 링크로 접속하여 확인 가능합니다.
> http://localhost:8080/swagger-ui/index.html

## 1. 도서 등록

### Request

```http
POST /books
```

#### Request Body

```json
{
  "id": "",
  "title": "흥부와 놀부",
  "author": "저자미상",
  "content": "옛날 옛적 흥부와 놀부가 살았어요. ...",
  "coverImageUrl": "",
  "category": "소설",
  "createdAt": "2026-06-01T12:34:56.789Z",
  "updatedAt": "2026-06-01T12:34:56.789Z"
}
```

### Response

```http
201 Created
```

#### Response Body
```json
{
  "author": "저자미상",
  "category": "소설",
  "content": "옛날 옛적 흥부와 놀부가 살았어요. ...",
  "coverImageUrl": "",
  "createdAt": "2026-06-01T12:34:56.789Z",
  "id": 1,
  "title": "흥부와 놀부",
  "updatedAt": "2026-06-01T12:34:56.789Z"
}
```

![POST /books](src/main/resources/screenshots/swagger/post_books.png)

## 2. 도서 목록 조회

### Request

```http
GET /books
```

### Response

```http
200 OK
```

#### Response Body
```json
[
  {
    "author": "저자미상",
    "category": "소설",
    "content": "옛날 옛적 흥부와 놀부가 살았어요. ...",
    "coverImageUrl": "",
    "createdAt": "2026-06-01T12:34:56.789Z",
    "id": 1,
    "title": "흥부와 놀부",
    "updatedAt": "2026-06-01T12:34:56.789Z"
  },
  {
    "author": "놀부아님",
    "category": "소설",
    "content": "옛날 옛적 아주 멋진 놀부와 쫄딱 망한 흥부가 살고있었대, ...",
    "coverImageUrl": "",
    "createdAt": "2026-06-01T12:34:56.789Z",
    "id": 2,
    "title": "놀부와 흥부",
    "updatedAt": "2026-06-01T12:34:56.789Z"
  }
]
```

![GET /books](src/main/resources/screenshots/swagger/get_books.png)

---

## 3. 도서 단건 조회

### Request

```http
GET /books/1
```

### Response

```http
200 OK
```

#### Response Body
```json
{
  "author": "저자미상",
  "category": "소설",
  "content": "옛날 옛적 흥부와 놀부가 살았어요. ...",
  "coverImageUrl": "",
  "createdAt": "2026-06-01T12:34:56.789Z",
  "id": 1,
  "title": "흥부와 놀부",
  "updatedAt": "2026-06-01T12:34:56.789Z"
}
```

![GET /books/1](src/main/resources/screenshots/swagger/get_books_1.png)

---

## 4. 도서 수정

### Request

```http
PUT /books/1
```

#### Request Body

```json
{
  "title": "클린 코드(개정판)",
  "author": "로버트 C. 마틴",
  "content": "애자일 소프트웨어 장인 정신 기술 서적의 개정판으로...",
  "coverImageUrl": "",
  "category": "IT/디지털",
  "createdAt": "2026-05-26T15:45:00.000Z",
  "updatedAt": "2026-05-26T15:45:00.000Z"
}
```

### Response

```http
200 OK
```

#### Response Body

```json
{
  "author": "로버트 C. 마틴",
  "category": "IT/디지털",
  "content": "애자일 소프트웨어 장인 정신 기술 서적의 개정판으로...",
  "coverImageUrl": "",
  "createdAt": "2026-06-01T12:34:56.789Z",
  "id": 1,
  "title": "클린 코드(개정판)",
  "updatedAt": "2026-05-26T15:45:00.000Z"
}
```

![PUT /books/1](src/main/resources/screenshots/swagger/put_books_1.png)

---

## 5. 도서 삭제

### Request

```http
DELETE /books/1
```

### Response
```http
204 No Content
```

![DELETE /books/1](src/main/resources/screenshots/swagger/delete_books_1.png)

---

## 6. 도서 AI커버이미지 수정

### Request

```http
PATCH /books/1/cover
```

```json
{
  "coverImageUrl": "newString"
}
```

### Response

```http
200 OK
```

#### Request Body
```json
{
  "id": 1,
  "title": "string",
  "author": "string",
  "content": "string",
  "coverImageUrl": "newString",
  "category": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

![PATCH /books/1/cover](src/main/resources/screenshots/swagger/patch_books_1_cover.png)

---

## 7. 도서 부분수정

### Request

```http
PATCH /books/1
```

#### Request Body
```json
{
  "title": "revised1",
  "author": "revised2",
  "updatedAt": "updatedTime"
}
```

### Response
```http
200 OK
```

#### Response Body
```json
{
  "id": 1,
  "title": "revised1",
  "author": "revised2",
  "content": "string",
  "coverImageUrl": "string",
  "category": "string",
  "createdAt": "string",
  "updatedAt": "updatedTime"
}
```

![PATCH /books/1](src/main/resources/screenshots/swagger/patch_books_1.png)

---
# 📚 Frontend-Backend 연동

---

## 🟡 도서 등록

**POST /books**

![도서등록.png](src/main/resources/screenshots/react/도서등록.png)

---

## 🟢 도서 목록 조회

**GET /books**

![도서조회.png](src/main/resources/screenshots/react/도서조회.png)

---

## 🟢 도서 상세 조회

**GET /books/{id}**

![도서상세.png](src/main/resources/screenshots/react/도서상세.png)

---

## 🔵 도서 수정

**PUT /books/{id}**

![도서수정P.png](src/main/resources/screenshots/react/도서수정P.png)

GET /books/{id} (수정 후 새로고침)
![도서수정후.png](src/main/resources/screenshots/react/도서수정후.png)

---

## 🔴 도서 삭제

**DELETE /api/books/{id}**
![도서삭제.png](src/main/resources/screenshots/react/도서삭제.png)

GET /books (삭제 후 도서목록 새로고침)
![도서삭제후.png](src/main/resources/screenshots/react/도서삭제후.png)

---

## 프론트-백엔드 연동 흐름

1. 사용자가 도서 등록 화면 입력
2. Frontend에서 API 요청
3. Backend에서 데이터 저장
4. DB 저장 완료
5. 결과 반환
6. Frontend 화면 갱신

---

# 📝 예외 검증 시나리오

> Backend에서 예외로 상정하는 모든 경우에 대해 Frontend 단에서 예외로 처리하게 되어있습니다.
> 고로, Backend에서 예외로 던지는 상황에 대해 Frontend에서 잘 처리하도록 선 조치되어있는지 검증을 수행해야겠습니다.

## 400 Bad Request

FE 공통 400번대 에러 처리
![img.png](src/main/resources/screenshots/react/400_fall.png)

### Title 누락
Swagger
![400_swagger_title.png](src/main/resources/screenshots/react/400_swagger_title.png)

Frontend
![400_titlenull.png](src/main/resources/screenshots/react/400_titlenull.png)

### Author 누락
Swagger
![400_swagger_author.png](src/main/resources/screenshots/react/400_swagger_author.png)

Frontend
![400_authornull.png](src/main/resources/screenshots/react/400_authornull.png)


### Content 누락
Swagger
![400_swagger_content.png](src/main/resources/screenshots/react/400_swagger_content.png)

Frontend
![400_frontend.png](src/main/resources/screenshots/react/400_frontend.png)

### Category 누락
Swagger
![400_swagger_category.png](src/main/resources/screenshots/react/400_swagger_category.png)

Frontend
![400_categorynull.png](src/main/resources/screenshots/react/400_categorynull.png)

## 404 Not Found
Swagger -> 유효하지 않은 id
![404_swagger.png](src/main/resources/screenshots/react/404_swagger.png)

Frontend
![404_fe.png](src/main/resources/screenshots/react/404_fe.png)

## 500 서버에러 + 서버미응답

Frontend
![img.png](src/main/resources/screenshots/react/500.png)

# 👥 Team R&R
## 운영 R&R
- 조장: 박지연
- 서기: 김종현
- 발표자: 김현성

## 기술 R&R
- PM: 김현성, 차태의
  - ERD / API 정의서, README.md 작성, 발표자료 준비, 통합 이슈 추적
- 백엔드 개발(1): 김민우
  - Book Entity 작성, BookRepository, H2 콘솔 확인, Lombok 4종 적용
- 백엔드 개발(2): 오채은
  - BookService 클래스, 비즈니스 로직, BookNotFoundException, `@Transactional`
- 백엔드 개발(3): 윤한아
  - BookController, 5종 CRUD 엔드포인트, `@Valid` + `@NotBlank`, Postman 테스트
- 통합 / 예외처리: 김종현
  - WebConfig(CORS), GlobalExceptionHandler, 풀스택 디버깅, 트러블슈팅 정리
- AI / Frontend 연동: 박지연
  - Frontend 코드 분석, fetch URL 변경 / 1차 연동, OpenAI 표지 흐름, E2E 시연 준비


# 트러블 슈팅

> 이번 프로젝트의 백엔드 및 풀스택 연동 과정에서는 시스템 안정성과 데이터 무결성을 확보하기 위해 세 가지 핵심적인 기술 의사결정을 수행했습니다. 우선, API 호출 결과로 204 No Content가 반환될 때 발생할 수 있는 데이터 문제를 방지하기 위해 프론트엔드와 성공 상태에 따른 분기 처리 로직을 규격화하였으며, 기존의 혼재된 수정 방식을 PUT 메서드로 단일화하여 코드 복잡도를 낮췄습니다.
> 또한, 외부 의존성이었던 JSON Server를 제거하고 우리가 직접 구축한 Spring Boot 백엔드로 API 엔드포인트를 완전히 이전하여 데이터의 독립적인 제어권을 확보하였습니다. 이 과정에서 프론트엔드와 백엔드 간의 통신 규격을 명확히 정립하고, AI 표지 생성이라는 비즈니스 로직을 효율적으로 배치함으로써, 안정적인 아키텍처 위에서 사용자 중심의 방어적 UX를 구현하는 완성도 높은 풀스택 시스템을 구축할 수 있었습니다.

# 회고

> 이번 미니 프로젝트는 단순한 기능 구현을 넘어, 원활한 풀스택 협업과 견고한 백엔드 아키텍처 설계에 대해 깊이 고민하고 성장할 수 있었던 소중한 경험이었습니다. 특히 프론트엔드와의 원활한 소통을 위해 Swagger를 도입하였습니다. 이를 통해 API 명세를 동기화하고 즉각적인 테스트 환경까지 제공함으로써 협업 효율을 획기적으로 끌어올리며 해결할 수 있었습니다.
> 또한, 도서 정보 수정 시 PATCH 대신 PUT을 채택하는 결정을 통해 데이터의 무결성을 지켜내는 API 표준화의 중요성을 체감했습니다. 무엇보다 Service와 Controller 계층 간의 결합도를 낮추기 위해 역할을 명확히 분리하며 데이터의 흐름을 체계화하였습니다.
> 이에 더해 @RestControllerAdvice를 활용한 전역 예외 처리를 구현했습니다. 이를 통해 서버의 내부 비즈니스 로직을 안전하게 지키며 프론트엔드와 최종 사용자에게 일관되고 직관적인 UX 피드백을 제공할 수 있었습니다.
> 결론적으로 단순한 서버 안정성 확보를 넘어 사용자 중심의 에러 핸들링과 UX 개선 역량을 한 단계 발전시키는 뜻 깊은 계기가 되었습니다.