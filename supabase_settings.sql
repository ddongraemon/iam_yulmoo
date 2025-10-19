-- 설정 테이블 생성 (스케줄러 상태 등 저장)
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- 기본 설정값 삽입
INSERT INTO settings (key, value, description) 
VALUES 
    ('scheduler_active', 'true', '카카오톡 자동 알림 스케줄러 활성화 상태')
ON CONFLICT (key) DO NOTHING;

-- RLS (Row Level Security) 정책 설정 (선택사항)
-- ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 설정 (필요시)
-- CREATE POLICY "Settings are viewable by everyone" ON settings
--     FOR SELECT USING (true);

-- 관리자만 수정 가능하도록 설정 (필요시)
-- CREATE POLICY "Settings are updatable by admin" ON settings
--     FOR ALL USING (auth.role() = 'service_role');
