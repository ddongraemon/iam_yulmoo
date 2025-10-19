# 율무 웹사이트 프로젝트 현황 (2025-10-19)

## 프로젝트 개요
- **프로젝트명**: 율무 웹사이트 (Pet Channel Website)
- **로컬 경로**: `C:\Users\ehdeh\pet-channel-website\pet-channel-website`
- **GitHub**: https://github.com/ddongraemon/iam_yulmoo
- **배포**: Vercel 자동 배포 설정 완료

## 주요 기능 구현 현황

### 1. 관리자 페이지 (Admin Dashboard)
- **파일**: `admin.html`
- **접근 경로**: `http://192.168.1.4:3000/admin.html`
- **주요 기능**:
  - 서버 상태 모니터링 (실시간)
  - API 연결 상태 확인 (실시간)
  - 마지막 동기화 시간 표시
  - 일일 방문자 통계 (막대 그래프)
  - 총 방문자 수 표시
  - 카카오톡 알림 관리

### 2. 서버 상태 모니터링
- **실시간 측정 항목**:
  - 서버 업타임
  - 메모리 사용률
  - 서버 이슈 감지
- **상태 분류**: 정상 / 주의 / 오류
- **기준**:
  - 메모리 사용률 >90%: 오류
  - 메모리 사용률 >80%: 주의
  - 업타임 <60초: 주의 (최근 재시작)

### 3. API 연결 상태
- **YouTube API**: 마지막 동기화 시간 기준 (12시간 이내: 정상)
- **Instagram API**: 마지막 동기화 시간 기준 (12시간 이내: 정상)
- **TikTok API**: 환경변수 설정 확인
- **Supabase**: 실시간 연결 테스트

### 4. 방문자 통계
- **데이터 소스**: Supabase visitor_counter 테이블
- **표시 기간**: 2025-10-18부터 현재까지
- **차트 타입**: 막대 그래프 (Chart.js)
- **데이터 표시**: 각 막대 끝에 수치 표시
- **Y축**: 동적 최대값 설정 (최고값 + 20% 여유)

### 5. 카카오톡 알림 시스템
- **구현 방식**: 실제 카카오톡 메시지 API 연동
- **사용자 계정**: 개인 계정 (비즈니스 계정 아님)
- **메시지 타입**: "나에게 메시지 보내기" (Message to Me)
- **다중 사용자 지원**: 여러 사용자 로그인 가능
- **토큰 관리**: Supabase DB 저장 (refresh token 암호화)

#### 카카오톡 로그인 플로우
1. `kakao-login.html`에서 카카오 로그인 시작
2. `kakao-callback.html`에서 인증 코드 처리
3. 서버에서 액세스 토큰/리프레시 토큰 발급
4. Supabase DB에 암호화하여 저장
5. 메모리에 로드하여 메시지 발송 준비

#### 자동 알림 스케줄
- **일일 알림**: 매일 21:00 KST 자동 발송
- **테스트 알림**: 관리자 페이지에서 수동 발송 가능
- **알림 내용**:
  - 서버 상태 (정상/비정상)
  - API 연결 상태
  - 마지막 동기화 시간
  - 오늘의 방문자 수

### 6. 데이터 동기화
- **스케줄러**: 매일 08:00, 13:00, 20:00 자동 업데이트
- **캐싱**: Vercel CDN 6시간 캐시 (`s-maxage=21600`)
- **실시간 호출**: 캐시 만료 시에만 API 호출

## 기술 스택

### 백엔드
- **Node.js**: HTTP 서버
- **Express**: API 라우팅 (직접 구현)
- **node-cron**: 스케줄러
- **axios**: HTTP 클라이언트
- **crypto**: 토큰 암호화 (AES-256-CBC)

### 프론트엔드
- **HTML/CSS/JavaScript**: 기본 웹 기술
- **Chart.js**: 방문자 통계 그래프
- **Chart.js Datalabels**: 막대 그래프 수치 표시

### 데이터베이스
- **Supabase**: 방문자 카운터, 카카오 사용자 토큰 저장
- **테이블**:
  - `visitor_counter`: 일일 방문자 수
  - `kakao_users`: 카카오 사용자 토큰 (암호화)

### 외부 API
- **YouTube Data API v3**: 채널 정보
- **Instagram Basic Display API**: 프로필 정보
- **TikTok API**: 사용자 정보
- **KakaoTalk Messaging API**: 알림 발송

## 환경 변수 설정
```env
# YouTube API
YOUTUBE_API_KEY=***
YOUTUBE_CHANNEL_ID=UCILbGCfIkc-7lGUinQhBLyg

# Instagram API
INSTAGRAM_ACCESS_TOKEN=***
INSTAGRAM_USER_ID=***

# TikTok API
TIKTOK_USERNAME=iam_yulmoo
TIKTOK_ACCESS_TOKEN=***

# Supabase
SUPABASE_URL=***
SUPABASE_ANON_KEY=***

# KakaoTalk API
KAKAO_REST_API_KEY=***
KAKAO_ADMIN_KEY=***
KAKAO_REDIRECT_URI_LOCAL=http://192.168.1.4:3000/kakao-callback.html
KAKAO_REDIRECT_URI_PROD=https://your-domain.vercel.app/auth/kakao/callback
```

## 파일 구조
```
pet-channel-website/
├── server.js                 # 메인 서버 파일
├── admin.html               # 관리자 페이지
├── kakao-login.html         # 카카오 로그인 페이지
├── kakao-callback.html      # 카카오 로그인 콜백
├── index.html               # 메인 페이지
├── styles.css               # 스타일시트
├── script.js                # 클라이언트 스크립트
├── .env                     # 환경 변수
├── package.json             # 의존성 관리
├── supabase_kakao_users.sql # Supabase 테이블 스키마
└── api/                     # API 엔드포인트
    ├── youtube-data.js
    └── social-stats.js
```

## API 엔드포인트

### 관리자 API
- `GET /api/admin/status`: 서버 상태, API 상태, 방문자 통계
- `POST /api/admin/send-notification`: 테스트 알림 발송
- `POST /api/admin/toggle-scheduler`: 스케줄러 활성화/비활성화

### 카카오톡 API
- `POST /api/kakao/save-token`: 토큰 저장
- `POST /api/kakao/get-token`: 인증 코드로 토큰 발급
- `GET /api/kakao/users`: 등록된 사용자 목록

### 데이터 API
- `GET /api/youtube-data`: YouTube 채널 정보
- `GET /api/social-stats`: 소셜미디어 통계
- `POST /api/visitor-counter`: 방문자 카운터

## 보안 설정
- **토큰 암호화**: AES-256-CBC 알고리즘 사용
- **환경 변수**: 민감한 정보는 .env 파일에 저장
- **CORS**: 필요한 도메인에만 허용
- **RLS**: Supabase Row Level Security (현재 unrestricted)

## 다음 작업 예정
1. **카카오톡 일일 21시 자동발송 활성화 확인**
2. **기타 기능 실시간 연동 여부 확인**
3. **Vercel 배포 시 환경 변수 설정**
4. **카카오톡 알림 내용 최적화**

## 주의사항
- API 키와 토큰은 절대 공개하지 않음
- 로컬 개발 시 `192.168.1.4:3000` 사용
- Vercel 배포 시 도메인 변경 필요
- Supabase 테이블 수동 생성 필요 (`supabase_kakao_users.sql` 실행)

## 서버 실행 방법
```bash
cd C:\Users\ehdeh\pet-channel-website\pet-channel-website
node server.js
```

**서버 접속**: `http://192.168.1.4:3000/`
**관리자 페이지**: `http://192.168.1.4:3000/admin.html`

