# Vercel 배포 가이드

## 🚀 Vercel KV를 사용한 방문자 카운터 통합

이 프로젝트는 Vercel KV (Redis)를 사용하여 모든 사용자가 공유하는 통합 방문자 카운터를 구현했습니다.

---

## 📋 배포 전 준비사항

### 1. Vercel 계정 생성
- https://vercel.com 에서 회원가입
- GitHub 계정 연동 권장

### 2. Vercel KV 스토어 생성
1. Vercel Dashboard → Storage 탭
2. "Create Database" 클릭
3. "KV" 선택
4. 데이터베이스 이름 입력 (예: `yulmoo-visitor-counter`)
5. Region 선택 (한국에 가까운 Tokyo 권장)
6. "Create" 클릭

---

## 🔧 Vercel 프로젝트 설정

### 방법 1: Vercel CLI 사용 (추천)

#### 1단계: Vercel CLI 설치
```bash
npm install -g vercel
```

#### 2단계: 프로젝트 로그인 및 초기화
```bash
cd C:\Users\ehdeh\pet-channel-website\pet-channel-website
vercel login
vercel
```

#### 3단계: KV 데이터베이스 연결
```bash
# 프로젝트에 KV 연결
vercel link
vercel env pull
```

Vercel Dashboard에서:
1. 프로젝트 → Settings → Storage
2. 앞서 생성한 KV 데이터베이스 연결

#### 4단계: 환경 변수 설정
Vercel Dashboard → Settings → Environment Variables에서 추가:

```
KV_REST_API_URL=<자동 생성됨>
KV_REST_API_TOKEN=<자동 생성됨>

YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=@Iam_Yulmoo
INSTAGRAM_USER_ID=your_instagram_user_id
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
INSTAGRAM_HANDLE=_iam_yulmoo
TIKTOK_USERNAME=iam_yulmoo
TIKTOK_CLIENT_SECRET=your_tiktok_secret
TIKTOK_ACCESS_TOKEN=your_tiktok_token
```

#### 5단계: 배포
```bash
vercel --prod
```

---

### 방법 2: GitHub 연동 (자동 배포)

#### 1단계: GitHub 레포지토리 생성
```bash
cd C:\Users\ehdeh\pet-channel-website\pet-channel-website
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/yulmoo-website.git
git push -u origin main
```

#### 2단계: Vercel에서 Import
1. Vercel Dashboard → "Add New..." → Project
2. GitHub 레포지토리 선택
3. Import 클릭

#### 3단계: KV 연결 및 환경 변수 설정
- Settings → Storage에서 KV 연결
- Settings → Environment Variables에서 환경 변수 추가

#### 4단계: 자동 배포
- `main` 브랜치에 push하면 자동으로 배포됨

---

## 🎯 배포 후 확인사항

### 1. 방문자 카운터 작동 확인
```
https://your-domain.vercel.app/
```
- 푸터의 TOTAL, TODAY 카운트 확인
- 새로고침해도 세션당 1회만 증가하는지 확인
- 다른 브라우저/시크릿 모드로 접속 시 TOTAL 증가 확인

### 2. API 엔드포인트 확인
```
GET  https://your-domain.vercel.app/api/visitor-count
POST https://your-domain.vercel.app/api/visitor-increment
```

### 3. Vercel KV 대시보드 확인
Vercel Dashboard → Storage → KV에서:
- `visitor_total`: 총 방문자 수
- `visitor_today_YYYY-MM-DD`: 오늘 방문자 수
- `visitor_last_date`: 마지막 업데이트 날짜

---

## 🔄 로컬 개발 환경

로컬에서는 기존 방식(파일 기반)을 사용합니다:

```bash
# 로컬 서버 실행
npm start

# 또는
node server.js
```

로컬 개발:
- `server.js` → 파일 기반 카운터 (`visitor-counter.json`)
- `script.js` → 로컬 API 호출

Vercel 배포:
- `api/visitor-count.js` → Vercel KV 사용
- `api/visitor-increment.js` → Vercel KV 사용
- `script.js` → 동일한 API 호출 (자동으로 Vercel Functions 사용)

---

## 📊 Vercel KV 무료 플랜 제한

- **스토리지**: 256 MB
- **요청 수**: 월 100,000 요청
- **대역폭**: 월 100 GB

방문자 카운터는 매우 가벼운 데이터이므로 충분합니다!

---

## 🐛 문제 해결

### KV 연결 안 됨
```bash
# KV 환경 변수 확인
vercel env ls

# KV 재연결
vercel link --yes
```

### 배포 후 카운터 작동 안 함
1. Vercel Dashboard → Deployments → 최신 배포 → Functions
2. `visitor-count`, `visitor-increment` 함수 로그 확인
3. 환경 변수 `KV_REST_API_URL`, `KV_REST_API_TOKEN` 확인

### CORS 오류
- `vercel.json`에서 CORS 설정 확인됨
- API 파일에서 Access-Control 헤더 설정됨

---

## 🎉 완료!

이제 Vercel에 배포된 웹사이트는:
- ✅ 모든 사용자가 공유하는 통합 방문자 카운터
- ✅ 날짜 자동 변경 시 TODAY 리셋
- ✅ 세션당 1회만 카운트
- ✅ 서버리스 환경에서 완벽하게 작동

배포 URL: `https://your-domain.vercel.app/`








