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
- 날짜: 2025-10-11
- 작업: 🎉 소셜 미디어 통합 통계 시스템 완성 (YouTube + Instagram + TikTok)
- 상태: 서버 정상 실행 중 (http://localhost:3000/)

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



