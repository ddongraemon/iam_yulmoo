# 🔄 세션 복원 가이드 (2025-10-13 21:20)

## 📍 프로젝트 정보

### 기본 정보
- **프로젝트명**: 율무 갤러리 웹사이트 (율무인데요)
- **로컬 경로**: `C:\Users\ehdeh\pet-channel-website\pet-channel-website`
- **GitHub**: https://github.com/ddongraemon/iam_yulmoo
- **Vercel 배포**: https://iam-yulmoo.vercel.app
- **마지막 커밋**: `c4fd29a` (2025-10-13 21:17)

---

## 🗂️ 프로젝트 구조

```
pet-channel-website/
├── api/                          # Vercel 서버리스 함수
│   ├── visitor-count.js         # 방문자 조회 (Supabase 기반)
│   ├── visitor-increment.js     # 방문자 증가 (Supabase 기반)
│   ├── youtube-data.js          # YouTube API
│   ├── social-stats.js          # 소셜 미디어 통합 통계
│   └── send-email.js            # 이메일 전송
│
├── index.html                    # 메인 페이지
├── gallery.html                  # 갤러리 페이지
├── contact.html                  # 문의하기 페이지
│
├── script.js                     # 메인 JavaScript
├── gallery.js                    # 갤러리 JavaScript (Supabase)
├── contact.js                    # 문의 JavaScript
│
├── styles.css                    # 메인 스타일
├── gallery.css                   # 갤러리 스타일
├── contact.css                   # 문의 스타일
│
├── server.js                     # 로컬 Node.js 서버
├── package.json                  # 의존성
├── .env                          # 환경 변수 (로컬)
│
├── youtube-data.json             # YouTube 캐시 데이터
├── social-stats.json             # 소셜 통계 캐시
└── visitor-counter.json          # 방문자 카운터 (로컬)
```

---

## 🔑 주요 기능

### 1. **갤러리 (Supabase)**
- Supabase 연동 이미지 갤러리
- 연도별 필터링 (최근 3년)
- 이미지 업로드/삭제 (비밀번호: `dbfan0505!`)
- 반응형 디자인 (데스크톱 캐러셀, 모바일 슬라이더)

### 2. **방문자 카운터 (Supabase)**
- ✅ Vercel KV → Supabase 전환 (무료 플랜)
- SessionStorage 중복 방지
- 자정 자동 리셋
- DB 테이블: `visitor_stats`

### 3. **YouTube API**
- 실시간 데이터: 환경 변수 필요
- Fallback: `youtube-data.json` (정적 파일)
- 6시간 CDN 캐시
- 마지막 업데이트: 2025-10-13 21:12

### 4. **소셜 미디어 통합**
- YouTube + Instagram + TikTok 통계
- 통합 구독자/팔로워 수
- 6시간 CDN 캐시

---

## 🔐 환경 변수 (.env)

```env
# YouTube Data API v3
YOUTUBE_API_KEY=AIzaSyDfGmZTlgUVeRlcANGxWGSfHKolYkJleSQ
YOUTUBE_CHANNEL_ID=@Iam_Yulmoo

# Instagram Graph API
INSTAGRAM_USER_ID=17841471961216287
INSTAGRAM_ACCESS_TOKEN=IGAAdSbbZByRhdBZAFMtOGdra3JYTldNMktma0tnMVA0Rmp6cDdEbGpLWHBiZA2pGY3ZA2akRwdGV2MmdrVDdpWTYyWVN0X2UwVUFvLVVQc0lTbU41MGV4UnpqanZAOc0JHUkVhSGhjNG95WXFDdnM4aC01RWFFRGdrUzc5N2luYU5nUQZDZD
INSTAGRAM_HANDLE=_iam_yulmoo

# TikTok API
TIKTOK_USERNAME=iam_yulmoo
TIKTOK_CLIENT_SECRET=CCm9Yvwu5Hn64P3K1gTbs9dPEqnRrjYj

# Gmail SMTP
EMAIL_USER=yulmoo.gam@gmail.com
EMAIL_PASS=asfefkztxlexhjyz
```

**⚠️ Vercel에는 환경 변수 미설정 (무료 플랜)**

---

## 🗄️ Supabase 설정

### 프로젝트 정보
- **URL**: `https://xthcitqhmsjslxayhgvt.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0aGNpdHFobXNqc2x4YXloZ3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg2MjE2OTMsImV4cCI6MjA0NDE5NzY5M30.lKzDVLhкойJ3_9-Y-bTHH-IbqEgw5dT_d2WiP6c1JQ`

### 데이터베이스 테이블

#### 1. `gallery` (갤러리)
```sql
CREATE TABLE gallery (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `visitor_stats` (방문자 카운터)
```sql
CREATE TABLE visitor_stats (
    id SERIAL PRIMARY KEY,
    stat_key VARCHAR(50) UNIQUE NOT NULL,
    stat_value INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 초기 데이터
INSERT INTO visitor_stats (stat_key, stat_value) VALUES 
    ('total', 0),
    ('today_2025-10-13', 0),
    ('last_date', 0);
```

---

## 📦 의존성 (package.json)

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@vercel/kv": "^1.0.1",
    "axios": "^1.7.7",
    "dotenv": "^16.4.5",
    "node-cron": "^3.0.3",
    "nodemailer": "^7.0.9"
  }
}
```

---

## 🚀 배포 상태

### Vercel 설정
- ✅ vercel.json: 제거됨 (자동 감지 사용)
- ✅ Framework: Other (정적 사이트)
- ✅ Output Directory: `.` (루트)
- ✅ Build Command: 없음

### 최근 배포
- **커밋**: `c4fd29a` (강제 재배포)
- **상태**: 배포 진행 중
- **데이터**: YouTube API 최신화 (2025-10-13 21:12)

### CDN 캐시
- YouTube API: 6시간 (`s-maxage=21600`)
- Social Stats: 6시간 (`s-maxage=21600`)
- 방문자 카운터: 캐시 없음 (실시간)

---

## ⚙️ 로컬 서버 (server.js)

### Cron 스케줄
- **08:00**: YouTube/소셜 데이터 자동 갱신
- **13:00**: YouTube/소셜 데이터 자동 갱신
- **20:00**: YouTube/소셜 데이터 자동 갱신

### 실행 방법
```bash
npm install
npm start
# 또는
node server.js
```

---

## 🔧 최근 해결한 이슈

### 1. Vercel KV → Supabase 전환 ✅
- 이유: Vercel 무료 플랜 제한
- 해결: Supabase PostgreSQL 사용
- 파일: `api/visitor-count.js`, `api/visitor-increment.js`

### 2. vercel.json 파싱 오류 ✅
- 해결: vercel.json 완전 제거
- 사용: Vercel 자동 감지 모드

### 3. YouTube API 최신화 ✅
- 마지막 갱신: 2025-10-13 21:12
- 방법: 일회성 수동 실행
- 결과: "술취한 엄마를 대하는 강아지반응"

---

## 📊 현재 데이터 스냅샷

### YouTube 통계 (2025-10-13 21:12)
- 구독자: 4.9K (4,870명)
- 영상 수: 252개
- 총 조회수: 5.4M

### 인기 영상 Top 3
1. "술취한 엄마를 대하는 강아지반응" - 710.3K 조회
2. "할머니를 세상 격하게 반기는 강아지" - 365.2K 조회
3. "세상에서 제일 수상한 강아지" - 212.8K 조회

---

## 🔄 다음 세션에서 복원하는 방법

### AI에게 전달할 메시지:

```
안녕하세요! 이전 세션에서 작업했던 '율무 갤러리 웹사이트' 프로젝트를 이어서 진행하고 싶습니다.

프로젝트 정보:
- 로컬 경로: C:\Users\ehdeh\pet-channel-website\pet-channel-website
- GitHub: https://github.com/ddongraemon/iam_yulmoo
- Vercel: https://iam-yulmoo.vercel.app
- 마지막 커밋: c4fd29a (2025-10-13 21:17)

주요 구성:
- Supabase: 갤러리 + 방문자 카운터
- YouTube API: 환경 변수 미설정 (정적 파일 사용)
- Vercel: 자동 감지 모드 (vercel.json 없음)

세션 복원 가이드: SESSION_RESTORE_GUIDE_2025-10-13.md 참고
```

---

## 📝 체크리스트

### 로컬 환경
- [x] Git 최신 상태 (c4fd29a)
- [x] .env 파일 존재
- [x] node_modules 설치됨
- [x] Supabase 연결 확인

### Vercel 배포
- [x] GitHub 연동
- [x] 자동 배포 활성화
- [x] vercel.json 제거됨
- [ ] 환경 변수 설정 (선택사항)

### Supabase
- [x] gallery 테이블
- [x] visitor_stats 테이블
- [x] Storage 버킷 (gallery-images)

---

## ⚠️ 주의사항

1. **환경 변수**: Vercel에 설정 안 됨 → 정적 파일 사용 중
2. **방문자 카운터**: Supabase 기반 (Vercel KV 아님)
3. **vercel.json**: 없음 (자동 감지 모드)
4. **YouTube 데이터**: 수동 갱신 필요 (Vercel 환경 변수 없음)

---

## 🛠️ 빠른 명령어

### Git
```bash
cd C:\Users\ehdeh\pet-channel-website\pet-channel-website
git status
git log --oneline -10
git pull origin main
```

### 로컬 서버
```bash
npm install
npm start
# http://localhost:3000
```

### YouTube API 수동 갱신
```bash
node -e "require('./server.js의 fetchYouTubeData 로직')"
```

---

**작성일**: 2025-10-13 21:20  
**작성자**: AI Assistant  
**버전**: 1.0




