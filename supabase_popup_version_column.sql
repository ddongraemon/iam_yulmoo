-- 기존 popup_settings 테이블에 version 컬럼 추가 (한 번만 실행)
-- admin에서 off 후 다시 on 시 24시간 보지않기 초기화용
ALTER TABLE popup_settings ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0;
