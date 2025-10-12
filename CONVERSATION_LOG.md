# 율무인데요 웹사이트 개발 대화 로그

## 프로젝트 개요
- **프로젝트명**: 율무인데요 - 율무(강아지)의 일상을 공유하는 유튜브/틱톡 채널 웹사이트
- **기술 스택**: HTML5, CSS3, JavaScript, Node.js 서버
- **디자인**: 모던한 다크 테마, 글래스모피즘 스타일
- **서버**: http://localhost:3000/

## 주요 작업 내용

### 1. 초기 프로젝트 복원
- 백업 파일에서 프로젝트 복원
- 서버 실행 확인 (포트 3000)

### 2. 모바일 반응형 네비게이션 수정
- 모바일 화면에서 네비게이션 크기를 화면 크기에 따라 비례적으로 조정
- 히어로 섹션 상단이 네비게이션에 가려지지 않도록 여백 조정
- 화면 크기별 네비게이션 높이 조정:
  - 태블릿 (769px-1024px): 65px
  - 모바일 (768px 이하): 60px
  - 소형 모바일 (480px 이하): 50px

### 3. 푸터 반응형 스타일 추가
- 화면 크기별로 푸터 부분이 작아지도록 작업
- 푸터 로고, 텍스트, 패딩 등이 화면 크기에 따라 조정됨
- 방문자 카운터도 함께 최적화

### 4. 히어로 버튼 모바일 최적화 (시도했지만 되돌림)
- 아이폰 16 크기 화면에서 버튼 최적화 시도
- 320px, 350px 등 다양한 화면 크기별 최적화 시도
- 최종적으로 모바일 작업 전 상태로 되돌림

### 5. 최종 푸터 반응형 완성
- 화면 크기별 푸터 반응형 스타일 최종 완성
- 태블릿, 모바일, 소형 모바일, 매우 작은 화면별 최적화

## 현재 파일 상태
- **index.html**: 메인 HTML 파일
- **styles.css**: 메인 CSS 파일 (반응형 스타일 포함)
- **script.js**: JavaScript 파일
- **server.js**: Node.js 서버 파일
- **yulmoo-dog.png**: 로고 이미지

## 백업 파일들
- styles-backup-20251011-030707.css (모바일 작업 전 백업)
- styles-backup.css (초기 백업)
- index-backup.html (HTML 백업)

## 주요 CSS 미디어 쿼리
```css
/* 태블릿 (769px-1024px) */
@media (max-width: 1024px) and (min-width: 769px)

/* 모바일 (768px 이하) */
@media screen and (max-width: 768px)

/* 소형 모바일 (480px 이하) */
@media (max-width: 480px)

/* 매우 작은 화면 (320px 이하) */
@media (max-width: 320px)
```

## 서버 실행 방법
```bash
cd C:\Users\ehdeh\pet-channel-website\pet-channel-website
node server.js
```
또는
```bash
npm start
```

## 접속 URL
- http://localhost:3000/

## 다음 작업 가능한 영역
1. 히어로 버튼 모바일 최적화 재시도
2. 영상 섹션 모바일 최적화
3. About 섹션 반응형 개선
4. Contact 섹션 모바일 최적화
5. 성능 최적화
6. SEO 개선

## 주의사항
- PC 화면은 원래 상태 유지
- 모바일 최적화 시 PC에 영향 주지 않도록 주의
- 백업 파일을 정기적으로 생성
- CSS 수정 시 인코딩 문제 주의 (UTF-8 사용)

## 마지막 업데이트
- 날짜: 2025-10-12
- 작업: 🎬 히어로 섹션 동영상 배경 구현 완료
- 상태: 서버 정상 실행 중 (http://localhost:3000/)

---

## 2025-10-12 (오후): 히어로 섹션 동영상 배경 구현

### 🎬 동영상 배경 완성

#### 동영상 파일
- **원본**: `Backgroundvod.mp4` (12.14MB)
- **모바일**: `vodmobile.mp4` (11.77MB)
- **길이**: 6-7초
- **재생**: 무한 반복

#### 구현 기능
1. **자동 재생**
   - `autoplay` 속성
   - JavaScript 강제 재생
   - 사용자 인터랙션 후 재시도

2. **무한 반복**
   - `loop` 속성
   - JavaScript 재생 종료 감지 및 재시작

3. **반응형 지원**
   - 데스크톱: Backgroundvod.mp4
   - 모바일: vodmobile.mp4
   - `object-fit: cover` 전체 화면 채움

4. **성능 최적화**
   - `preload="auto"` 미리 로드
   - `muted` 음소거
   - `playsinline` 모바일 인라인 재생

5. **오버레이 효과**
   - 어두운 오버레이 (35% 투명도)
   - 텍스트 가독성 향상

6. **자동 재생 보장**
   - 로드 완료 시 재생
   - 페이지 visible 상태 복원 시 재생
   - 재생 실패 시 사용자 클릭 후 재시도

#### 수정된 파일
- `index.html` - 동영상 요소 추가
- `styles.css` - 동영상 배경 스타일
- `script.js` - 동영상 재생 로직

#### CSS 스타일
```css
.hero-video-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
}

.hero-video {
    object-fit: cover;
    min-width: 100%;
    min-height: 100%;
}

.video-overlay {
    background: rgba(0, 0, 0, 0.35);
}
```

#### z-index 레이어링
- **0**: 동영상 배경
- **1**: 비디오 오버레이
- **2**: floating-element (거의 투명)
- **10**: hero-container
- **20**: hero-content, hero-visual

#### 성능 고려사항
- 11-12MB 동영상 (압축 실패)
- 최적화 기법으로 로딩 체감 최소화
- 실제 테스트 후 필요 시 재압축 가능

### 📝 작업 완료 체크리스트
- ✅ 동영상 파일 프로젝트에 추가
- ✅ HTML에 video 태그 추가
- ✅ CSS 스타일 구현
- ✅ JavaScript 자동 재생 로직
- ✅ 무한 반복 구현
- ✅ 반응형 지원
- ✅ 오버레이 효과
- ✅ z-index 레이어링

---

## 2025-10-12 (오전): Vercel 배포 최적화 및 방문자 카운터 통합

### 🚀 Vercel KV 방문자 카운터 시스템

#### 문제점
- 기존 방문자 카운터는 로컬 스토리지 기반
- 각 브라우저/세션마다 다른 TOTAL 카운트 표시
- Vercel 배포 시 파일 시스템 사용 불가 (서버리스 환경)

#### 해결 방법: Vercel KV (Redis) 통합
1. **@vercel/kv 패키지 설치**
   ```json
   "dependencies": {
     "@vercel/kv": "^1.0.1"
   }
   ```

2. **Vercel Serverless Functions 생성**
   - `api/visitor-count.js` - 방문자 카운터 조회
   - `api/visitor-increment.js` - 방문자 카운터 증가

3. **주요 기능**
   - ✅ 모든 사용자가 공유하는 통합 TOTAL 카운트
   - ✅ 날짜 자동 변경 시 TODAY 리셋
   - ✅ 세션당 1회만 카운트 (sessionStorage)
   - ✅ Vercel 서버리스 환경 완벽 지원

4. **데이터 구조 (Redis)**
   ```
   visitor_total: 총 방문자 수
   visitor_today_YYYY-MM-DD: 오늘 방문자 수
   visitor_last_date: 마지막 업데이트 날짜
   ```

#### 새로 추가된 파일
- `api/visitor-count.js` - Vercel Function (조회)
- `api/visitor-increment.js` - Vercel Function (증가)
- `vercel.json` - Vercel 배포 설정
- `.vercelignore` - 배포 제외 파일
- `VERCEL_DEPLOYMENT_GUIDE.md` - 상세 배포 가이드
- `README.md` - 프로젝트 문서

#### 수정된 파일
- `package.json` - @vercel/kv 패키지 추가
- `script.js` - 서버 기반 카운터로 변경
- `server.js` - 로컬 개발용 통합 카운터 추가

#### Vercel 배포 설정
- **스토리지**: Vercel KV (Redis)
- **Functions**: Serverless
- **무료 플랜**: 월 100,000 요청 (충분)

#### 배포 방법
```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인 및 배포
vercel login
vercel

# 프로덕션 배포
vercel --prod
```

### 📱 Contact 폼 반응형 최적화

#### 1. 달력 아이콘 반응형 조정
- 시작일정(희망일) 필드의 달력 아이콘 크기를 화면 크기에 맞게 리사이징
- 화면별 아이콘 크기:
  - PC (1400px+): 20px
  - 1200px-1399px: 19px
  - 1024px-1199px: 18px
  - 태블릿 (1024px 이하): 17px
  - 모바일 (1023px 이하): 16px → 11px (360px 이하)

#### 2. 문의 버튼 경로 통합
- 홈 화면 하단 "이메일 보내기" 버튼 경로 변경
- `mailto:` → `/contact.html`
- 히어로 섹션 문의 버튼과 동일하게 통합

#### 수정된 파일
- `contact.css` - 달력 아이콘 반응형 스타일 추가
- `index.html` - 하단 문의 버튼 경로 변경

### 🔧 환경 구성

#### 로컬 개발 환경
- Node.js 서버 (`server.js`)
- 파일 기반 카운터 (`visitor-counter.json`)
- 로컬 테스트용

#### Vercel 배포 환경
- Serverless Functions (`api/*.js`)
- Vercel KV (Redis)
- 프로덕션용

#### 양방향 호환
- 같은 API 엔드포인트 사용
- 로컬/배포 환경 자동 감지
- 추가 설정 불필요

### 📊 무료 플랜 제한

#### Vercel KV
- 스토리지: 256 MB
- 요청 수: 월 100,000
- 대역폭: 월 100 GB
- ✅ 방문자 카운터에 충분

#### Vercel Functions
- 실행 시간: 10초/요청
- 메모리: 1024 MB
- 배포 수: 무제한
- ✅ 현재 사용량으로 충분

### 🎯 배포 체크리스트

1. ✅ Vercel KV 데이터베이스 생성
2. ✅ 프로젝트 연결 (`vercel link`)
3. ✅ 환경 변수 설정
   - KV_REST_API_URL (자동)
   - KV_REST_API_TOKEN (자동)
   - YOUTUBE_API_KEY
   - INSTAGRAM_ACCESS_TOKEN
   - 기타 API 키
4. ✅ 배포 (`vercel --prod`)
5. ✅ 방문자 카운터 작동 확인

### 📁 프로젝트 구조 업데이트

```
pet-channel-website/
├── api/                           # 🆕 Vercel Serverless Functions
│   ├── visitor-count.js           # 방문자 카운터 조회
│   └── visitor-increment.js       # 방문자 카운터 증가
├── index.html
├── contact.html
├── styles.css
├── contact.css                    # ✅ 달력 아이콘 반응형 추가
├── script.js                      # ✅ 서버 기반 카운터로 변경
├── server.js                      # ✅ 통합 카운터 추가
├── package.json                   # ✅ @vercel/kv 추가
├── vercel.json                    # 🆕 Vercel 배포 설정
├── .vercelignore                  # 🆕 배포 제외 파일
├── VERCEL_DEPLOYMENT_GUIDE.md     # 🆕 배포 가이드
└── README.md                      # 🆕 프로젝트 문서
```

### 🔄 다음 작업 가능 영역

1. ✅ Vercel 배포 완료
2. 커스텀 도메인 연결
3. Google Analytics 통합
4. Lighthouse 성능 최적화
5. PWA 기능 추가
6. Contact 폼 이메일 발송 기능 (Vercel + Nodemailer)

---

## 2025-10-11: 소셜 미디어 통합 통계 시스템

### 🎉 YouTube + Instagram + TikTok 통합 완료

#### 구현된 기능
1. **다중 플랫폼 API 연동**
   - ✅ YouTube Data API v3 (구독자, 영상 수, 총 조회수)
   - ✅ Instagram Graph API (팔로워, 게시물 수)
   - ✅ TikTok API 구조 준비 (Access Token 필요)

2. **통합 통계 시스템**
   - 모든 플랫폼 데이터를 자동으로 합산
   - 히어로 섹션에 통합 통계 표시
   - 실시간 데이터 업데이트 (08:00, 13:00, 20:00)

3. **데이터 수집 항목**
   - **총 구독자/팔로워 수** = YouTube + Instagram + TikTok
   - **총 영상/게시물 수** = YouTube + Instagram + TikTok
   - **총 조회수** = YouTube 조회수 (Instagram/TikTok은 전체 조회수 미제공)

#### 현재 통계 (2025-10-11 17:31)
- 📊 **총 구독자/팔로워**: 3.1K (3,097명)
- 🎬 **총 영상/게시물**: 185개
- 👁️ **총 조회수**: 0 (테스트 데이터)

**플랫폼별 현황:**
- YouTube: 0 구독자, 3 영상 (테스트 채널 @yybbkkz)
- Instagram: 3,097 팔로워, 182 게시물 (_iam_yulmoo)
- TikTok: Access Token 대기 중 (iam_yulmoo)

#### 새로 추가된 파일
- `social-stats.json` - 통합 통계 캐시
- `.env` - Instagram, TikTok API 정보 추가

#### 수정된 파일
- `server.js` - 통합 통계 시스템 전체 재작성
  - YouTube API 확장 (총 영상 수, 총 조회수 추가)
  - Instagram Graph API 연동
  - TikTok API 구조 준비
  - 통합 통계 합산 로직
- `script.js` - 통합 통계 표시 로직 추가
  - `/api/social-stats` 엔드포인트 호출
  - 히어로 섹션 통계 자동 업데이트

#### API 엔드포인트
- `/api/youtube-data` - YouTube 영상 데이터
- `/api/social-stats` - 통합 소셜 미디어 통계 ⭐ 신규
- `/api/update-all-stats` - 전체 통계 수동 업데이트 (테스트용)

#### Instagram 설정
- User ID: `17841471961216287`
- 핸들: `_iam_yulmoo`
- Access Token: 설정 완료 (60일 유효)
- API: Instagram Graph API v18.0

#### TikTok 설정
- Username: `iam_yulmoo`
- Client Secret: 설정 완료
- ⚠️ Access Token: 미발급 (OAuth 인증 필요)
- 발급 후 `.env`에 `TIKTOK_ACCESS_TOKEN` 추가하면 자동 연동

#### 스케줄링
- 🕗 **08:00** - 모든 플랫폼 데이터 업데이트
- 🕐 **13:00** - 모든 플랫폼 데이터 업데이트
- 🕗 **20:00** - 모든 플랫폼 데이터 업데이트

#### 추후 작업 사항
1. **TikTok Access Token 발급**
   - TikTok for Developers에서 OAuth 인증
   - Access Token 발급 후 `.env`에 추가
   - 자동으로 TikTok 데이터 연동 시작

2. **실제 채널로 변경 (API 할당량 복구 후)**
   - YouTube: `@yybbkkz` → `@Iam_Yulmoo`
   - `.env` 파일에서 한 줄만 수정

3. **Instagram 조회수 집계 (선택사항)**
   - 릴스/동영상 조회수 개별 집계
   - API 할당량 고려 필요

---

## 2025-10-11: YouTube API 연동 작업

### 🎬 YouTube Data API v3 연동 완료

#### 구현 기능
1. **YouTube API 자동 스케줄링**
   - 매일 08:00, 13:00, 20:00에만 API 호출
   - 그 외 시간에는 캐시된 데이터 사용
   - 서버 시작 시 무조건 한 번 데이터 로드

2. **가져오는 데이터**
   - 채널 구독자 수 (히어로 섹션에 표시)
   - 인기 영상 3개 (조회수 순)
   - 최신 영상 3개 (업로드 날짜 순)
   - 각 영상 정보: 제목, 썸네일, 러닝타임, 조회수, 좋아요, 댓글 수

3. **데이터 캐싱 시스템**
   - `youtube-data.json` 파일에 데이터 저장
   - API 할당량 절약 (하루 3번만 호출, 약 606 units)
   - 서버 재시작 시에도 캐시 데이터 유지

4. **채널 핸들 지원**
   - YouTube 핸들 (@yybbkkz) 자동 인식
   - Search API로 채널 ID 자동 검색
   - 채널 ID 캐싱으로 중복 검색 방지

#### 설치된 패키지
```json
{
  "dotenv": "^16.4.5",    // 환경 변수 관리
  "node-cron": "^3.0.3",  // 스케줄링
  "axios": "^1.7.7"       // HTTP 요청
}
```

#### 새로 추가된 파일
- `package.json` - npm 패키지 설정
- `.env` - API 키 및 채널 정보 (보안)
- `youtube-data.json` - API 데이터 캐시
- `node_modules/` - npm 패키지

#### 수정된 파일
- `server.js` - YouTube API 로직, 스케줄러, 캐싱 시스템 추가
- `script.js` - YouTube 데이터 로드 및 화면 표시 로직 추가
- `.gitignore` - 보안 파일 제외 설정

#### 현재 설정
- **테스트 채널**: @yybbkkz (https://www.youtube.com/@yybbkkz)
- **추후 변경 예정**: @Iam_Yulmoo (API 할당량 복구 후)

#### API 엔드포인트
- `/api/youtube-data` - 캐시된 YouTube 데이터 조회
- `/api/update-youtube-data` - 수동 데이터 업데이트 (테스트용)

#### 주요 특징
- ✅ 영상 섹션 외 다른 디자인 요소 건들지 않음 (요구사항 준수)
- ✅ 영상 카드 클릭 시 YouTube 영상으로 이동
- ✅ 호버 시 플레이 버튼 애니메이션
- ✅ 썸네일 확대 효과
- ✅ 반응형 디자인 유지

#### 스케줄러 작동 시간
- 🕗 **08:00** - 아침 데이터 업데이트
- 🕐 **13:00** - 점심 데이터 업데이트
- 🕗 **20:00** - 저녁 데이터 업데이트

#### 채널 변경 방법
추후 API 할당량이 복구되면 `.env` 파일 수정:
```env
YOUTUBE_CHANNEL_ID=@Iam_Yulmoo
```

---

## 이전 업데이트 내역

### 푸터 반응형 스타일 완성
- 날짜: 2025-10-11 (이전)
- 작업: 푸터 반응형 스타일 완성
- 상태: 완료



