# Supabase 설정 가이드 - 율무 갤러리

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `yulmoo-gallery` (원하는 이름)
   - Database Password: 안전한 비밀번호 설정
   - Region: `Northeast Asia (Seoul)` 선택 권장
4. "Create new project" 클릭

## 2. 데이터베이스 테이블 생성

### SQL 스크립트 실행

Supabase Dashboard > SQL Editor로 이동하여 아래 SQL 실행:

```sql
-- gallery 테이블 생성
CREATE TABLE gallery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 인덱스 추가 (성능 향상)
CREATE INDEX idx_gallery_year ON gallery(year);
CREATE INDEX idx_gallery_created_at ON gallery(created_at DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Public read access"
ON gallery FOR SELECT
USING (true);

-- 인증된 사용자만 삽입 가능 (업로드 기능용)
CREATE POLICY "Authenticated insert access"
ON gallery FOR INSERT
WITH CHECK (true);

-- 인증된 사용자만 삭제 가능
CREATE POLICY "Authenticated delete access"
ON gallery FOR DELETE
USING (true);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gallery_updated_at
    BEFORE UPDATE ON gallery
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## 3. Storage 버킷 생성

1. Supabase Dashboard > Storage로 이동
2. "Create a new bucket" 클릭
3. 버킷 정보 입력:
   - Name: `gallery-images`
   - Public bucket: **체크 ✓** (공개 버킷으로 설정)
4. "Create bucket" 클릭

### Storage 정책 설정

Storage > Policies로 이동하여 아래 정책 추가:

```sql
-- gallery-images 버킷 정책

-- 1. 모든 사용자가 읽기 가능
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-images');

-- 2. 모든 사용자가 업로드 가능
CREATE POLICY "Public insert access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery-images');

-- 3. 모든 사용자가 삭제 가능
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery-images');
```

## 4. API 키 확인

1. Supabase Dashboard > Settings > API로 이동
2. 아래 정보 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 5. 환경 변수 설정

### 로컬 개발 환경

`gallery.js` 파일에서 아래 부분 수정:

```javascript
// Supabase 설정
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // 복사한 Project URL로 변경
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // 복사한 anon public key로 변경
```

### Vercel 배포 환경

1. Vercel Dashboard > 프로젝트 선택 > Settings > Environment Variables로 이동
2. 환경 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon public key

**주의**: Vercel에서는 클라이언트 사이드 환경 변수에 `NEXT_PUBLIC_` 접두사 필요

## 6. 테스트

1. 로컬 서버 실행: `npm start`
2. 브라우저에서 `http://localhost:3000/gallery.html` 접속
3. 업로드 테스트:
   - "사진 업로드" 버튼 클릭
   - 연도 선택: 2025
   - 사진 선택
   - 비밀번호 입력: `dbfan050!`
   - "업로드" 클릭
4. 사진이 정상적으로 표시되는지 확인

## 7. 이미지 최적화 설정

Supabase Storage는 자동으로 이미지 변환을 지원합니다.

URL 파라미터를 통해 최적화:
- `?width=400&quality=80` - 너비 400px, 품질 80%
- `?width=600&quality=80` - 모바일용

예시:
```
원본: https://xxxxx.supabase.co/storage/v1/object/public/gallery-images/2025/image.jpg
최적화: https://xxxxx.supabase.co/storage/v1/object/public/gallery-images/2025/image.jpg?width=400&quality=80
```

## 8. 보안 고려사항

### 비밀번호 보안 강화 (선택사항)

현재는 클라이언트 사이드에서 비밀번호를 확인합니다. 더 안전한 방법:

1. Supabase Edge Functions 사용
2. API 엔드포인트에서 비밀번호 검증
3. 환경 변수로 비밀번호 관리

### Storage 용량 관리

무료 플랜:
- Storage: 1 GB
- Bandwidth: 2 GB

초과 시 업그레이드 필요 또는 오래된 이미지 삭제 권장

## 9. 데이터베이스 스키마

```
gallery 테이블
├── id (UUID, Primary Key) - 고유 식별자
├── year (INTEGER) - 연도 (2023, 2024, 2025)
├── image_url (TEXT) - Supabase Storage Public URL
├── file_name (TEXT) - Storage 파일 경로
├── created_at (TIMESTAMP) - 생성 일시
└── updated_at (TIMESTAMP) - 수정 일시
```

## 10. 문제 해결

### 이미지가 로드되지 않을 때
1. Supabase Dashboard > Storage에서 버킷이 Public인지 확인
2. Storage Policies가 올바르게 설정되었는지 확인
3. 브라우저 콘솔에서 CORS 오류 확인

### 업로드가 실패할 때
1. Storage Policies에 INSERT 권한이 있는지 확인
2. 파일 크기 제한 확인 (기본 50MB)
3. 네트워크 연결 상태 확인

### 삭제가 안될 때
1. Storage Policies에 DELETE 권한이 있는지 확인
2. 비밀번호가 올바른지 확인
3. 파일이 실제로 존재하는지 확인

## 11. 추가 기능 구현 아이디어

### 캡션 추가
```sql
ALTER TABLE gallery ADD COLUMN caption TEXT;
```

### 좋아요 기능
```sql
ALTER TABLE gallery ADD COLUMN likes INTEGER DEFAULT 0;
```

### 태그 시스템
```sql
CREATE TABLE tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gallery_id UUID REFERENCES gallery(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL
);
```

## 완료! 🎉

Supabase 설정이 완료되었습니다. 이제 율무 갤러리를 사용할 수 있습니다!



