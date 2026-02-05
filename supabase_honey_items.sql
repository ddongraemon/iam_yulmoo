-- 율무의 꿀템추천 6개 항목 (admin에서 이미지/태그/설명/링크 관리)
CREATE TABLE IF NOT EXISTS honey_items (
    id INTEGER PRIMARY KEY CHECK (id >= 1 AND id <= 6),
    image_url TEXT,
    link_url TEXT,
    tags TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- tags: JSON 배열 문자열 예시 '["태그1","태그2"]'

INSERT INTO honey_items (id, image_url, link_url, tags, description)
VALUES
    (1, '', '', '[]', ''),
    (2, '', '', '[]', ''),
    (3, '', '', '[]', ''),
    (4, '', '', '[]', ''),
    (5, '', '', '[]', ''),
    (6, '', '', '[]', '')
ON CONFLICT (id) DO NOTHING;
