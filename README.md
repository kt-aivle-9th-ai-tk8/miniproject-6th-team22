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
---
## AWS CodePipelin
<table>
  <tr>
    <td width="50%" valign="top">
      <img width="718" height="338" alt="image" src="https://github.com/user-attachments/assets/b6718526-bf8c-464d-859b-f318dbd4556a" />
      <br><br>
      <b>Source</b> : GitHub에서 최신 버전의 프론트엔드 소스 코드를 AWS로 가져옴<br>
      <b>Build</b> : 컨테이너 환경에서 의존성 패키지를 설치하고 배포용 정적파일을 빌드
    </td>
    <td width="50%" valign="top">
      <img width="723" height="338" alt="image" src="https://github.com/user-attachments/assets/a0cd6651-6629-4b28-aa02-bf5ff53de2a1" />
      <br><br>
      <b>Source</b> : GitHub에서 최신 버전의 백엔드 소스 코드를 AWS로 가져옴<br>
      <b>Build</b> : 컴파일러가 Dockerfile을 실행하여 파이프라인 내 소스 코드를 바탕으로 컨테이너 이미지 빌드
    </td>
  </tr>
</table>

---

## 무중단 배포 전략

<img width="908" height="98" alt="image" src="https://github.com/user-attachments/assets/4d6b9b3f-4069-428f-83fa-dcc7c2759133" />

* **Rolling Update 메커니즘:** 구버전 Pod를 한 번에 죽이지 않고 신버전 Pod를 점진적으로 생성하고 교체.
MaxSurge 설정을 활용해 배포 중에도 트래픽 수용 용량 그대로 유지.

* **상태 확인 및 트래픽 제어:** 신규 Pod가 완전히 구동되어 Ready 상태가 되기 전까지 트래픽 유입을 차단하여 배포 초기 유저가 에러를 겪지 않도록 제어

---

## EKS HPA Auto Scaling
​
<img width="665" height="307" alt="image" src="https://github.com/user-attachments/assets/c2ae9d3c-bfee-483a-a450-a94caeab936a" />

* **도입 배경:** CI/CD를 통한 배포 자동화 이후, AI 도서 표지 생성 등 리소스 소모가 큰 작업 시 발생하는 갑작스러운 트래픽 폭주를 방어하기 위함

* **HPA 적용:** Pod의 CPU 사용률이 설정된 임계치를 초과할 경우 작동

* **부하 증가 시:** Kubernetes가 파드 개수를 자동으로 늘려 트래픽 분산 및 서버 다운 방지

* **부하 감소 시:** 기본 파드 개수로 다시 축소하여 불필요한 클라우드 리소스 비용 절감

* **검증 완료:** 자체 부하 테스트를 통해 임계치 도달 시 서버가 정상적으로 동적 확장됨을 확인

---

## HPA Pod 스케일링 검증

<img width="626" height="96" alt="image" src="https://github.com/user-attachments/assets/841f9b18-5ab0-46fa-b4d6-a8a061796568" />

**1단계: 평상시** 

<img width="626" height="98" alt="image" src="https://github.com/user-attachments/assets/40dbaacd-5655-4657-88dd-93437fbf2baf" />

**2단계: 얕은 부하**

<img width="627" height="309" alt="image" src="https://github.com/user-attachments/assets/2fae8773-8631-4b21-b856-565ff052a5a6" />

**3단계: 집중 부하 및 한계 테스트**
