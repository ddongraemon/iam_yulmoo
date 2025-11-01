-- 카카오 사용자 토큰 저장 테이블 생성
CREATE TABLE IF NOT EXISTS kakao_users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    access_token TEXT NOT NULL,
    refresh_token_encrypted TEXT, -- 암호화된 refresh token
    login_time TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_kakao_users_user_id ON kakao_users(user_id);
CREATE INDEX IF NOT EXISTS idx_kakao_users_updated_at ON kakao_users(updated_at);

-- RLS (Row Level Security) 정책 설정 (선택사항)
-- ALTER TABLE kakao_users ENABLE ROW LEVEL SECURITY;

-- 사용자 조회 정책 (필요시)
-- CREATE POLICY "Users can view their own data" ON kakao_users
--     FOR SELECT USING (auth.uid()::text = user_id);

-- 사용자 삽입/업데이트 정책 (필요시)
-- CREATE POLICY "Users can insert/update their own data" ON kakao_users
--     FOR ALL USING (auth.uid()::text = user_id);




