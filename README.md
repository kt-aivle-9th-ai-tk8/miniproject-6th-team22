# AIVLE_Mini-Project_6
AI 책 표지 자동 생성 기반 도서 관리 시스템
미니프로젝트 6차 22조

> **KT AIVLE School 6차 미니프로젝트**
> React 프론트엔드와 Spring Boot REST API 서버를 연동하여 도서 데이터를 관리하고, AWS CloudFront, S3, EKS, RDS MySQL 기반으로 배포 및 데이터 저장 환경을 구축한 웹 애플리케이션

## Role
| 이름 | 주 역할 (Role) | 담당 기능 및 파트 (Details) | 비고 |
| :---: | :---: | :--- | :---: |
| **차태의** | 👑 조장 / Infra (CI) | 파이프라인 구성, 부하 테스트 | |
| **김민우** | 🌐 Infra (Scaling) | 파이프라인 구성, Load Balance 구성 | 발표 진행 |
| **김현성** | 💻 Dev | RDS 데이터베이스 구축, backend-RDS 연결 | 발표 자료 작성 |
| **송지수** | 📊 PM & Monitoring | 프로젝트 총괄 관리, Cloud Watch 모니터링 | |
| **윤서영** | 💻 Dev | Cloud Front 구성, BackEnd 자동 연동 | 발표 자료 작성 |
| **윤한아** | 🌐 Infra (CD) | 이미지 생성 기능 BackEnd에 추가, backend-RDS 연결 | 발표 자료 작성 |
| **이성호** | 💻 Dev | E2E 체크 리스트 작성, 부하 테스트 | 서기 |

---

## System Environment
* **Frontend:** React (Vite 기반 SPA 개발 환경)
* **Backend:** Spring Boot, Java
* **Database:** RDS MySQL
* **Infra:** AWS S3, CloudFront, EKS, ECR
* **CI/CD:** CodePipeline, CodeBuild
* **Container:** Docker, Kubernetes

---

## System architecture
<img width="586" height="602" alt="시스템 아키텍처" src="https://github.com/user-attachments/assets/b8fc2746-7a57-46c8-94d7-7b977e4bb441" />


---
## 디렉토리 구조
```
AIVLE_Mini-Project_4/
└── backend/
    ├── ...
    └──buildspec.yml
└── frontend/
    ├── ...
    └──buildspec.yml
└── deploy/
    ├── .gitkeep
    ├── backend-deploy.yaml
    ├── backend-hpa.yaml
    ├── backend-ingress.yaml
    └── backend-service.yaml
└── .gitignore
```
