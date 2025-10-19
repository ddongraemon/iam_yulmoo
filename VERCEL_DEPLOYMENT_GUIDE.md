# Vercel 배포 가이드 - 카카오톡 일일 알림

## 🚀 Vercel 배포 시 카카오톡 21시 자동 알림 설정

### 📋 배포 전 체크리스트

#### 1. 환경변수 설정 (Vercel Dashboard)
다음 환경변수들을 Vercel 프로젝트 설정에 추가해야 합니다:

```env
# YouTube Data API v3 설정
YOUTUBE_API_KEY=AIzaSyDfGmZTlgUVeRlcANGxWGSfHKolYkJleSQ
YOUTUBE_CHANNEL_ID=UCILbGCfIkc-7lGUinQhBLyg

# Instagram Graph API 설정
INSTAGRAM_USER_ID=17841471961216287
INSTAGRAM_ACCESS_TOKEN=IGAAdSbbZByRhdBZAFMtOGdra3JYTldNMktma0tnMVA0Rmp6cDdEbGpLWHBiZA2pGY3ZA2akRwdGV2MmdrVDdpWTYyWVN0X2UwVUFvLVVQc0lTbU41MGV4UnpqanZAOc0JHUkVhSGhjNG95WXFDdnM4aC01RWFFRGdrUzc5N2luYU5nUQZDZD
INSTAGRAM_HANDLE=_iam_yulmoo

# TikTok API 설정
TIKTOK_USERNAME=iam_yulmoo
TIKTOK_CLIENT_SECRET=CCm9Yvwu5Hn64P3K1gTbs9dPEqnRrjYj

# 카카오톡 메시지 API 설정
KAKAO_REST_API_KEY=8be4d404f675dfbe4263dd82898135f7
KAKAO_ADMIN_KEY=4f492dd7aaa3ff3ec05edaeb043c4235
KAKAO_REDIRECT_URI_LOCAL=http://localhost:3000/auth/kakao/callback
KAKAO_REDIRECT_URI_PROD=https://www.yulmoo.site/auth/kakao/callback

# Supabase 설정
SUPABASE_URL=https://xthcitqhmsjslxayhgvt.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0aGNpdHFobXNqc2x4YXloZ3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMzIwMDEsImV4cCI6MjA3NTkwODAwMX0.fKDWahWKb-ZvQm6_wJfghCaLdH5eQ5aJ27A6Etr_HZ4

# Vercel Cron Jobs 보안
CRON_SECRET=vercel-daily-notification-secret-key-2025
```

#### 2. Supabase 테이블 확인
다음 테이블들이 Supabase에 생성되어 있는지 확인:
- `visitor_counter` (방문자 카운터)
- `kakao_users` (카카오 사용자 토큰)
- `settings` (스케줄러 설정)

### ⏰ 스케줄링 설정

#### Vercel Cron Jobs
- **실행 시간**: 매일 UTC 12:00 (한국시간 21:00)
- **API 엔드포인트**: `/api/cron/daily-notification`
- **설정 파일**: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-notification",
      "schedule": "0 12 * * *"
    }
  ]
}
```

### 🔧 주요 기능

#### 1. 스케줄러 상태 관리
- Supabase `settings` 테이블에서 `scheduler_active` 상태 확인
- 관리자 페이지에서 토글 가능
- 서버 재시작 후에도 상태 유지

#### 2. 카카오톡 토큰 관리
- Supabase에 암호화되어 저장
- 토큰 만료 시 자동 갱신
- 여러 사용자 지원

#### 3. 한국시간 기반 초기화
- 방문자 카운터: 한국시간 00:00에 초기화
- 일일 알림: 한국시간 21:00에 발송

### 📱 알림 메시지 예시

```
🌟 율무의 일일 알림 🌟

안녕하세요! 2025년 10월 19일 토요일입니다.

오늘도 율무와 함께 즐거운 하루 보내세요! 🐾

새로운 영상과 소식이 업데이트되었는지 확인해보세요!

👉 https://iam-yulmoo.vercel.app
```

### 🛡️ 보안 설정

#### Vercel Cron Jobs 보안
- `CRON_SECRET` 환경변수로 인증
- 무단 접근 방지

#### 토큰 암호화
- AES-256-CBC 암호화
- Supabase에 안전하게 저장

### 📊 모니터링

#### 로그 확인
- Vercel Functions 로그에서 실행 결과 확인
- 성공/실패 통계 제공

#### 관리자 페이지
- `https://your-domain.vercel.app/admin.html`
- 스케줄러 상태 토글
- 실시간 모니터링

### 🚨 문제 해결

#### 1. 알림이 발송되지 않는 경우
- Vercel 환경변수 확인
- Supabase 연결 상태 확인
- 카카오 사용자 토큰 상태 확인

#### 2. 시간대 문제
- 한국시간 기반으로 수정됨
- UTC 12:00 = KST 21:00

#### 3. 토큰 만료
- 자동 갱신 기능 내장
- 갱신 실패 시 로그 확인

### 📝 배포 후 확인사항

1. **환경변수 설정 완료**
2. **Supabase 테이블 생성 완료**
3. **Vercel Cron Jobs 활성화**
4. **관리자 페이지 접근 가능**
5. **카카오 사용자 등록 완료**
6. **스케줄러 활성화 상태 확인**

### 🎯 예상 동작

- **매일 한국시간 21:00**: 자동으로 카카오톡 일일 알림 발송
- **스케줄러 비활성화 시**: 알림 발송 건너뜀
- **토큰 만료 시**: 자동 갱신 후 재시도
- **실패 시**: 로그에 상세 정보 기록

---

**배포 완료 후 첫 알림은 다음날 한국시간 21:00에 발송됩니다!** 🎉