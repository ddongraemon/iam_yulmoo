-- 메인 페이지 팝업 설정 테이블 (admin에서 on/off, 기간, 이미지, 링크 관리)
CREATE TABLE IF NOT EXISTS popup_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    enabled BOOLEAN NOT NULL DEFAULT false,
    start_date DATE,
    end_date DATE,
    image_url TEXT,
    link_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- admin에서 off 후 다시 on 시 24시간 보지않기 초기화용 (버전 변경 시 클라이언트가 다시 팝업 표시)
ALTER TABLE popup_settings ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 0;

-- 단일 행만 유지
INSERT INTO popup_settings (id, enabled, start_date, end_date, image_url, link_url, version)
VALUES (1, false, NULL, NULL, '', '', 0)
ON CONFLICT (id) DO NOTHING;
