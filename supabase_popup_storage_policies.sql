-- popup 버킷 RLS 정책 (row-level security 오류 해결)
-- Supabase 대시보드 → SQL Editor에서 이 스크립트를 실행하세요.
-- (이미 정책을 만든 적 있으면 아래 DROP 3줄만 실행 후 다시 CREATE 실행)

DROP POLICY IF EXISTS "popup: anon INSERT" ON storage.objects;
DROP POLICY IF EXISTS "popup: anon UPDATE" ON storage.objects;
DROP POLICY IF EXISTS "popup: anon SELECT" ON storage.objects;

-- 1. anon이 popup 버킷에 파일 업로드(INSERT) 허용
CREATE POLICY "popup: anon INSERT"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'popup');

-- 2. upsert 시 기존 파일 덮어쓰기 위해 UPDATE 허용
CREATE POLICY "popup: anon UPDATE"
ON storage.objects
FOR UPDATE
TO anon
USING (bucket_id = 'popup')
WITH CHECK (bucket_id = 'popup');

-- 3. 업로드/조회 시 객체 확인용 SELECT 허용 (공개 버킷이면 읽기는 기본 허용일 수 있음)
CREATE POLICY "popup: anon SELECT"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'popup');
