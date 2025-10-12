# 율무인데요 - 웹사이트 🐕

율무의 일상을 공유하는 유튜브/틱톡/인스타그램 채널 공식 웹사이트

## 🌟 주요 기능

### 1. 소셜 미디어 통합 통계
- YouTube + Instagram + TikTok 통합 구독자/팔로워 수
- 총 영상/게시물 수 집계
- 자동 업데이트 (매일 08:00, 13:00, 20:00)

### 2. YouTube 영상 자동 로드
- 인기 영상 TOP 3
- 최신 업로드 영상 3개
- 실시간 조회수, 좋아요, 댓글 수 표시

### 3. 통합 방문자 카운터
- **Vercel KV (Redis) 기반** - 모든 사용자 공유
- 총 방문자 수 (TOTAL)
- 오늘 방문자 수 (TODAY)
- 날짜 자동 변경 시 TODAY 리셋

### 4. 반응형 디자인
- PC, 태블릿, 모바일 최적화
- 다크 테마 + 글래스모피즘 스타일
- 부드러운 애니메이션

### 5. 문의 폼
- 캠페인 유형 선택
- 이메일 자동 발송
- 반응형 폼 디자인

## 🛠️ 기술 스택

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Font Awesome 아이콘
- Intersection Observer API
- Fetch API

### Backend
- Node.js (로컬 개발)
- Vercel Serverless Functions (배포)
- Vercel KV (Redis) - 방문자 카운터

### API 연동
- YouTube Data API v3
- Instagram Graph API v18.0
- TikTok API (준비 중)

### 배포
- Vercel (추천)
- GitHub Pages (정적 버전)

## 📦 설치 및 실행

### 로컬 개발 환경

#### 1. 저장소 클론
```bash
git clone https://github.com/YOUR_USERNAME/yulmoo-website.git
cd yulmoo-website
```

#### 2. 패키지 설치
```bash
npm install
```

#### 3. 환경 변수 설정
`.env` 파일 생성:
```env
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=@Iam_Yulmoo
INSTAGRAM_USER_ID=your_instagram_user_id
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
INSTAGRAM_HANDLE=_iam_yulmoo
TIKTOK_USERNAME=iam_yulmoo
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token
```

#### 4. 서버 실행
```bash
npm start
```

서버 실행 후: http://localhost:3000/

## 🚀 Vercel 배포

자세한 배포 가이드는 **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** 참고

### 빠른 배포
```bash
npm install -g vercel
vercel login
vercel
```

## 📁 프로젝트 구조

```
yulmoo-website/
├── index.html              # 메인 페이지
├── contact.html            # 문의 페이지
├── styles.css              # 메인 스타일
├── contact.css             # 문의 페이지 스타일
├── script.js               # 메인 JavaScript
├── contact.js              # 문의 페이지 JavaScript
├── server.js               # Node.js 서버 (로컬 개발용)
├── api/                    # Vercel Serverless Functions
│   ├── visitor-count.js    # 방문자 카운터 조회
│   └── visitor-increment.js # 방문자 카운터 증가
├── package.json            # 의존성 패키지
├── vercel.json             # Vercel 설정
├── .env                    # 환경 변수 (Git 제외)
└── README.md               # 이 파일
```

## 🎯 API 엔드포인트

### 방문자 카운터
- `GET /api/visitor-count` - 현재 카운트 조회
- `POST /api/visitor-increment` - 방문자 증가

### YouTube & 소셜 미디어
- `GET /api/youtube-data` - YouTube 영상 데이터
- `GET /api/social-stats` - 통합 소셜 미디어 통계

## 🔧 환경 변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `YOUTUBE_API_KEY` | YouTube API 키 | ✅ |
| `YOUTUBE_CHANNEL_ID` | YouTube 채널 ID | ✅ |
| `INSTAGRAM_USER_ID` | Instagram User ID | ✅ |
| `INSTAGRAM_ACCESS_TOKEN` | Instagram Access Token | ✅ |
| `TIKTOK_ACCESS_TOKEN` | TikTok Access Token | ❌ |
| `KV_REST_API_URL` | Vercel KV API URL (자동) | ✅ (Vercel) |
| `KV_REST_API_TOKEN` | Vercel KV API Token (자동) | ✅ (Vercel) |

## 📊 방문자 카운터 시스템

### 로컬 개발
- 파일 기반 (`visitor-counter.json`)
- 로컬 테스트용

### Vercel 배포
- Vercel KV (Redis) 기반
- 모든 사용자 데이터 공유
- 자동 날짜 변경 감지

### 작동 방식
1. 사용자 첫 방문 시 카운터 증가
2. 같은 세션에서 재방문 시 증가 안 함 (sessionStorage)
3. 자정이 지나면 TODAY 자동 리셋
4. TOTAL은 계속 누적

## 📝 주요 작업 로그

상세한 작업 내역은 **[CONVERSATION_LOG.md](./CONVERSATION_LOG.md)** 참고

## 🐛 문제 해결

### 서버가 실행 안 됨
```bash
# 포트 3000이 사용 중인 경우
# 1. 기존 프로세스 종료 (Ctrl+C)
# 2. 또는 다른 포트 사용
PORT=3001 npm start
```

### API 데이터가 로드 안 됨
- `.env` 파일 확인
- API 키 유효성 확인
- `npm start` 재실행

### Vercel 배포 후 카운터 작동 안 함
- Vercel KV 연결 확인
- 환경 변수 설정 확인
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) 참고

## 📄 라이선스

ISC License

## 👤 작성자

**율무인데요**
- YouTube: [@Iam_Yulmoo](https://www.youtube.com/@Iam_Yulmoo)
- Instagram: [@_iam_yulmoo](https://www.instagram.com/_iam_yulmoo)
- TikTok: [@iam_yulmoo](https://www.tiktok.com/@iam_yulmoo)
- Email: iamyulmoo@naver.com

---

⭐ 이 프로젝트가 마음에 드신다면 별표를 눌러주세요!
