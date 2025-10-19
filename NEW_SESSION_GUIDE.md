# 새로운 세션 복원 가이드

## 🚀 빠른 시작 (5분 복원)

### 1단계: 프로젝트 디렉토리로 이동
```bash
cd C:\Users\ehdeh\pet-channel-website\pet-channel-website
```

### 2단계: 서버 실행
```bash
node server.js
```

### 3단계: 브라우저에서 확인
- **로컬**: http://localhost:3000/
- **배포**: https://iam-yulmoo.vercel.app

## 📋 세션 복원 체크리스트

### ✅ 필수 확인사항
- [ ] Node.js 서버가 정상 실행되는가?
- [ ] 히어로 섹션 비디오 배경이 재생되는가?
- [ ] 방문자 카운터가 작동하는가?
- [ ] 비디오 카드들이 올바르게 표시되는가?
- [ ] 반응형 디자인이 모든 화면에서 작동하는가?

### 🔧 문제 해결
- [ ] 포트 충돌 시: `Stop-Process -Name "node" -Force`
- [ ] 캐시 문제 시: `Ctrl + F5` 강제 새로고침
- [ ] Git 상태 확인: `git status`

## 📁 프로젝트 구조 이해

```
pet-channel-website/
├── 📄 index.html              # 메인 페이지
├── 🎨 styles.css              # 모든 스타일 (반응형 포함)
├── ⚡ script.js               # 클라이언트 JavaScript
├── 🖥️ server.js               # Node.js 서버
├── 🎬 Backgroundvod.mp4       # 데스크톱 비디오 배경
├── 📱 vodmobile.mp4           # 모바일 비디오 배경
├── 📁 api/                    # Vercel Serverless Functions
│   ├── visitor-count.js       # 방문자 수 조회
│   └── visitor-increment.js   # 방문자 수 증가
├── ⚙️ vercel.json             # Vercel 배포 설정
└── 📚 *.md                    # 문서 파일들
```

## 🎯 주요 기능 현황

### ✅ 완료된 기능
1. **히어로 섹션 비디오 배경**
   - 자동 재생, 무한 반복
   - 반응형 지원 (데스크톱/모바일)
   - 블러 + 밝기 + 대비 효과

2. **Vercel KV 방문자 카운터**
   - 실시간 통계
   - 세션별 중복 방지
   - 날짜별 카운팅

3. **비디오 카드 최적화**
   - 검은색 라운드 배경
   - 반응형 위치 조정
   - 클래스명 충돌 해결

4. **반응형 디자인**
   - 모든 화면 크기 지원
   - 480px 이하 특별 최적화
   - 일관된 사용자 경험

### 🔄 지속적인 기능
- YouTube/Instagram/TikTok API 연동
- 이메일 문의 시스템
- 소셜 미디어 통계 표시

## 🛠️ 개발 환경 설정

### 필수 도구
- **Node.js**: v18+ (현재 v22.20.0)
- **Git**: 버전 관리
- **브라우저**: Chrome/Firefox (개발자 도구 필요)

### 주요 명령어
```bash
# 서버 실행
node server.js

# Git 상태 확인
git status

# 변경사항 커밋
git add .
git commit -m "메시지"
git push origin main

# Vercel 배포 (자동)
# GitHub 푸시 시 자동 배포됨
```

## 📊 배포 상태

### GitHub 저장소
- **URL**: https://github.com/ddongraemon/iam_yulmoo
- **상태**: 최신 커밋 푸시 완료
- **자동 배포**: Vercel 연결됨

### Vercel 배포
- **URL**: https://iam-yulmoo.vercel.app
- **상태**: 자동 배포 활성화
- **KV 저장소**: 방문자 카운터용 설정 완료

## 🎨 스타일 가이드

### CSS 구조
- **기본 스타일**: 1-800줄
- **비디오 관련**: 800-900줄
- **반응형 미디어 쿼리**: 900줄 이후

### 주요 클래스
```css
.hero-video-background    # 히어로 비디오 컨테이너
.hero-video              # 비디오 요소
.hero-video-overlay      # 비디오 오버레이
.video-thumbnail         # 비디오 카드 썸네일
.video-duration          # 재생시간
.video-views             # 조회수
```

## 🚨 주의사항

### 비디오 파일
- `Backgroundvod.mp4`: 11.6MB (데스크톱용)
- `vodmobile.mp4`: 11.77MB (모바일용)
- **주의**: 큰 파일 크기로 인한 로딩 시간 고려

### API 키 관리
- 환경변수로 관리
- Vercel 대시보드에서 설정
- 로컬 개발 시 `.env` 파일 사용

### 브라우저 호환성
- 모던 브라우저 지원
- 자동재생 정책 고려
- 모바일 최적화

## 📞 지원 및 문제 해결

### 자주 발생하는 문제
1. **비디오 재생 안됨**: 브라우저 자동재생 정책
2. **방문자 카운터 오류**: Vercel KV 연결 상태
3. **CSS 변경사항 미적용**: 브라우저 캐시

### 해결 방법
1. **강제 새로고침**: `Ctrl + F5`
2. **개발자 도구**: 캐시 비활성화
3. **시크릿 모드**: 테스트용

---

**가이드 작성일**: 2025년 1월 12일  
**프로젝트 상태**: 모든 주요 기능 완료, 배포 완료  
**다음 세션 준비**: 완료 ✅









