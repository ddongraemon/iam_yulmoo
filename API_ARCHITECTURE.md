# 율무인데요 웹사이트 API 아키텍처

## 📋 목차
1. [로컬 서버 환경](#로컬-서버-환경)
2. [Vercel 배포 환경](#vercel-배포-환경)
3. [API 엔드포인트 비교](#api-엔드포인트-비교)
4. [외부 API 호출 조건](#외부-api-호출-조건)
5. [환경 변수 설정](#환경-변수-설정)

---

## 🖥️ 로컬 서버 환경

### 서버 구조
- **파일**: `server.js`
- **포트**: 3000 (기본값)
- **실행 방법**: `node server.js` 또는 `npm start`

### API 처리 방식

#### 1. 방문자 카운터
```javascript
// 엔드포인트: /api/visitor-count (GET)
// 엔드포인트: /api/visitor-increment (POST)
```

**저장 방식**: 
- 📁 파일 기반: `visitor-counter.json`
- 로컬 파일 시스템에 JSON 형태로 저장
- 날짜별 자동 리셋 (자정에 TODAY 카운트 초기화)

**작동 조건**:
- ✅ 항상 작동
- 서버 실행 시 파일이 없으면 자동 생성
- 환경 변수 불필요

#### 2. YouTube 데이터
```javascript
// 엔드포인트: /api/youtube-data
```

**외부 API 호출**:
- 🌐 YouTube Data API v3
- `https://www.googleapis.com/youtube/v3/channels`
- `https://www.googleapis.com/youtube/v3/search`
- `https://www.googleapis.com/youtube/v3/videos`

**작동 조건**:
- ✅ 환경 변수 필수:
  - `YOUTUBE_API_KEY`: YouTube API 키
  - `YOUTUBE_CHANNEL_ID`: 채널 핸들 (예: @Iam_Yulmoo)
- 📁 캐시 파일: `youtube-data.json`
- ⏰ 자동 업데이트: 매일 08:00, 13:00, 20:00 (cron 스케줄러)
- 💾 API 실패 시: 캐시 파일 사용

**스케줄러**:
```javascript
cron.schedule('0 8 * * *', () => fetchAllSocialMediaStats());
cron.schedule('0 13 * * *', () => fetchAllSocialMediaStats());
cron.schedule('0 20 * * *', () => fetchAllSocialMediaStats());
```

#### 3. 소셜 미디어 통합 통계
```javascript
// 엔드포인트: /api/social-stats
```

**외부 API 호출**:

**3-1. YouTube**
- API: YouTube Data API v3
- 가져오는 데이터: 구독자 수, 영상 수, 조회수

**3-2. Instagram**
- 🌐 Instagram Graph API v18.0
- `https://graph.instagram.com/v18.0/{USER_ID}`
- 가져오는 데이터: 팔로워 수, 게시물 수

**3-3. TikTok**
- 🌐 TikTok Open API
- `https://open.tiktokapis.com/v2/user/info/`
- 가져오는 데이터: 팔로워 수, 영상 수

**작동 조건**:
- ✅ 환경 변수 필수:
  - `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`
  - `INSTAGRAM_USER_ID`, `INSTAGRAM_ACCESS_TOKEN`
  - `TIKTOK_ACCESS_TOKEN` (선택사항)
- 📁 캐시 파일: `social-stats.json`
- ⏰ 자동 업데이트: YouTube와 동일 (08:00, 13:00, 20:00)
- 💾 API 실패 시: 캐시 파일 사용 또는 기본값 0 반환

### 로컬 서버 시작 시 동작
1. ✅ 캐시 파일 확인 (`youtube-data.json`, `social-stats.json`)
2. 📊 캐시 파일 존재 시: 기존 데이터 사용
3. ⚠️ 캐시 파일 없을 시: 스케줄된 시간까지 대기 또는 수동 업데이트
4. 🔄 수동 업데이트: `http://localhost:3000/api/update-all-stats` 접속

---

## ☁️ Vercel 배포 환경

### 서버리스 함수 구조
- **폴더**: `api/`
- **실행 방식**: Vercel Serverless Functions
- **자동 배포**: Git push 시 자동

### API 처리 방식

#### 1. 방문자 카운터
```javascript
// 파일: api/visitor-count.js (GET)
// 파일: api/visitor-increment.js (POST)
```

**저장 방식**:
- ☁️ **Vercel KV (Redis)** - 클라우드 기반
- 모든 사용자가 공유하는 통합 카운터
- 키 구조:
  - `visitor_total`: 총 방문자 수
  - `visitor_today_YYYY-MM-DD`: 오늘 방문자 수
  - `visitor_last_date`: 마지막 업데이트 날짜

**작동 조건**:
- ✅ Vercel KV 데이터베이스 연결 필요
- ✅ 환경 변수 자동 생성:
  - `KV_REST_API_URL` (Vercel이 자동 설정)
  - `KV_REST_API_TOKEN` (Vercel이 자동 설정)
- 📦 패키지: `@vercel/kv` 설치됨
- 🔄 날짜별 자동 리셋 (API 호출 시 자동 감지)

**Vercel KV 제한 (무료 플랜)**:
- 스토리지: 256 MB
- 요청 수: 월 100,000 요청
- 대역폭: 월 100 GB

#### 2. YouTube 데이터
```javascript
// 파일: api/youtube-data.js
```

**외부 API 호출**:
- 로컬 서버와 동일한 YouTube Data API v3 사용
- 차이점: 캐시 파일 없음 (매번 API 호출)

**작동 조건**:
- ✅ Vercel 환경 변수 설정 필수:
  - `YOUTUBE_API_KEY`
  - `YOUTUBE_CHANNEL_ID`
- 📊 CDN 캐시: `Cache-Control: s-maxage=21600` (6시간)
- ❌ 파일 캐시 없음 (서버리스 특성상)
- ⚠️ API 실패 시: 500 에러 반환

**CDN 캐시 헤더**:
```javascript
res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate');
```
- 6시간(21600초) 동안 Vercel CDN에 캐시
- API 호출 최소화 → 비용 절감

#### 3. 소셜 미디어 통합 통계
```javascript
// 파일: api/social-stats.js
```

**외부 API 호출**:
- YouTube, Instagram, TikTok API 동시 호출 (Promise.all)
- 로컬 서버와 동일한 로직

**작동 조건**:
- ✅ Vercel 환경 변수 설정 필수:
  - `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID`
  - `INSTAGRAM_USER_ID`, `INSTAGRAM_ACCESS_TOKEN`
  - `TIKTOK_ACCESS_TOKEN` (선택사항)
- 📊 CDN 캐시: 6시간
- ❌ 파일 캐시 없음
- ⚠️ API 실패 시: 기본값 0 반환

### Vercel 배포 시 주의사항
1. 🚫 **cron 스케줄러 작동 안 함** (서버리스 특성)
2. 📁 **파일 시스템 사용 불가** (읽기 전용)
3. ☁️ **CDN 캐시 활용 필수** (API 호출 비용 절감)
4. 🔑 **환경 변수 설정 필수** (Vercel Dashboard)

---

## 🔄 API 엔드포인트 비교

| 엔드포인트 | 로컬 서버 | Vercel 배포 | 외부 API |
|-----------|----------|------------|---------|
| `/api/visitor-count` | ✅ 파일 기반 | ✅ Vercel KV | ❌ 없음 |
| `/api/visitor-increment` | ✅ 파일 기반 | ✅ Vercel KV | ❌ 없음 |
| `/api/youtube-data` | ✅ 파일 캐시 | ✅ CDN 캐시 | ✅ YouTube API |
| `/api/social-stats` | ✅ 파일 캐시 | ✅ CDN 캐시 | ✅ YouTube + Instagram + TikTok |
| `/api/update-all-stats` | ✅ 수동 업데이트 | ❌ 없음 | - |

---

## 🌐 외부 API 호출 조건

### 1. YouTube Data API v3

**호출 시점 (로컬)**:
- ⏰ 자동: 매일 08:00, 13:00, 20:00 (cron)
- 🔧 수동: `/api/update-all-stats` 접속
- 🚀 서버 시작 시: 캐시 파일 없으면 대기

**호출 시점 (Vercel)**:
- 🌐 실시간: 사용자가 페이지 접속할 때마다 (CDN 캐시 만료 시)
- 📊 CDN 캐시: 6시간 동안 재사용

**필수 조건**:
```env
YOUTUBE_API_KEY=your_api_key_here
YOUTUBE_CHANNEL_ID=@Iam_Yulmoo
```

**API 할당량**:
- YouTube API 무료 할당량: 하루 10,000 units
- 채널 정보 조회: 1 unit
- 영상 검색: 100 units
- 영상 상세 정보: 1 unit
- 1회 호출 비용: 약 200 units

**절약 방법**:
- 로컬: 캐시 파일 사용 + 하루 3회만 업데이트
- Vercel: CDN 캐시 6시간 → 하루 최대 4회 호출

### 2. Instagram Graph API v18.0

**호출 시점**:
- 로컬/Vercel 모두 YouTube와 동일

**필수 조건**:
```env
INSTAGRAM_USER_ID=17841471961216287
INSTAGRAM_ACCESS_TOKEN=your_long_lived_token_here
INSTAGRAM_HANDLE=_iam_yulmoo
```

**API 제한**:
- Access Token 유효기간: 60일 (Long-Lived Token)
- 갱신 필요: 만료 전 재발급
- 호출 제한: 앱당 시간당 200회

**토큰 갱신 방법**:
```bash
curl -X GET "https://graph.instagram.com/refresh_access_token
  ?grant_type=ig_refresh_token
  &access_token={YOUR_TOKEN}"
```

### 3. TikTok Open API

**호출 시점**:
- 로컬/Vercel 모두 YouTube와 동일

**필수 조건** (선택사항):
```env
TIKTOK_USERNAME=iam_yulmoo
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_ACCESS_TOKEN=your_access_token
```

**현재 상태**:
- ⚠️ Access Token 미설정 시: 기본값 0 반환
- ✅ 에러 없이 계속 작동

**API 제한**:
- OAuth 인증 필요
- Access Token 유효기간: 앱 설정에 따라 다름

---

## 🔐 환경 변수 설정

### 로컬 개발 환경

**파일**: `.env` (프로젝트 루트)

```env
# YouTube Data API v3
YOUTUBE_API_KEY=AIzaSyDfGmZTlgUVeRlcANGxWGSfHKolYkJleSQ
YOUTUBE_CHANNEL_ID=@Iam_Yulmoo

# Instagram Graph API
INSTAGRAM_USER_ID=17841471961216287
INSTAGRAM_ACCESS_TOKEN=IGAAdSbbZByRhdBZAFMt...
INSTAGRAM_HANDLE=_iam_yulmoo

# TikTok API (선택)
TIKTOK_USERNAME=iam_yulmoo
TIKTOK_CLIENT_SECRET=CCm9Yvwu5Hn64P3K1gTbs9dPEqnRrjYj
# TIKTOK_ACCESS_TOKEN= (OAuth 인증 후 추가)

# 서버 설정
PORT=3000
HOST=127.0.0.1

# Gmail SMTP (Contact 폼)
EMAIL_USER=yulmoo.gam@gmail.com
EMAIL_PASS=asfefkztxlexhjyz
```

**주의사항**:
- ✅ `.env` 파일은 `.gitignore`에 포함 (Git 업로드 안 됨)
- ✅ 서버 재시작 시 자동 로드 (`dotenv` 패키지)

### Vercel 배포 환경

**설정 위치**: Vercel Dashboard → Settings → Environment Variables

**필수 변수**:
```
YOUTUBE_API_KEY
YOUTUBE_CHANNEL_ID
INSTAGRAM_USER_ID
INSTAGRAM_ACCESS_TOKEN
INSTAGRAM_HANDLE
TIKTOK_USERNAME
TIKTOK_CLIENT_SECRET
EMAIL_USER
EMAIL_PASS
```

**자동 생성 변수** (Vercel KV 연결 시):
```
KV_REST_API_URL (자동)
KV_REST_API_TOKEN (자동)
```

**설정 방법**:
1. Vercel Dashboard 접속
2. 프로젝트 선택
3. Settings → Environment Variables
4. 각 변수 추가 (Production, Preview, Development 모두 체크)
5. Storage → KV 데이터베이스 연결

---

## 📊 프론트엔드 API 호출 흐름

### script.js의 API 호출 로직

```javascript
// 1. YouTube 데이터 로드
async function loadYouTubeData() {
    try {
        // API 우선 호출
        const youtubeResponse = await fetch('/api/youtube-data');
        if (youtubeResponse.ok) {
            youtubeData = await youtubeResponse.json();
        }
    } catch (apiError) {
        // API 실패 시 정적 JSON 파일 사용 (로컬 전용)
        const fallbackResponse = await fetch('/youtube-data.json');
        youtubeData = await fallbackResponse.json();
    }
}

// 2. 소셜 미디어 통계 로드
const statsResponse = await fetch('/api/social-stats');
const statsData = await statsResponse.json();

// 3. 방문자 카운터
const response = await fetch('/api/visitor-count');
const data = await response.json();
```

**특징**:
- 🌐 프론트엔드는 환경을 구분하지 않음
- 📡 항상 `/api/*` 엔드포인트 호출
- 🔄 로컬/Vercel 서버가 자동으로 적절한 방식으로 처리

---

## 🎯 요약

### 로컬 서버 특징
- 📁 파일 시스템 사용 (캐시 저장)
- ⏰ cron 스케줄러 작동 (하루 3회 자동 업데이트)
- 💾 API 실패 시 캐시 파일 사용
- 🔧 수동 업데이트 가능

### Vercel 배포 특징
- ☁️ 서버리스 함수 (무상태)
- 📊 CDN 캐시 활용 (6시간)
- 🌐 실시간 API 호출 (캐시 만료 시)
- 🔑 Vercel KV 사용 (방문자 카운터)

### 외부 API 호출 최적화
- 로컬: **캐시 파일 + 스케줄러** → API 호출 최소화
- Vercel: **CDN 캐시** → 사용자 경험 개선 + 비용 절감

---

**마지막 업데이트**: 2025-10-13  
**작성자**: AI Assistant  
**프로젝트**: 율무인데요 웹사이트















