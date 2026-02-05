// Vercel: GET /api/gallery?year=2026|2025|2024|2023|all
// 빌드 시 생성된 gallery-data.json 목록 반환 (이미지 폴더는 번들하지 않음)
const path = require('path');
const fs = require('fs');

function getDataPath() {
    return path.join(process.cwd(), 'api', 'gallery-data.json');
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const yearParam = (req.query && req.query.year) || 'all';

    try {
        const dataPath = getDataPath();
        if (!fs.existsSync(dataPath)) {
            return res.status(200).json({ images: [] });
        }
        const raw = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(raw);
        let images = Array.isArray(data.images) ? data.images : [];

        if (yearParam !== 'all') {
            images = images.filter((item) => item.year === yearParam);
        }

        return res.status(200).json({ images });
    } catch (err) {
        console.warn('gallery API error:', err.message);
        return res.status(200).json({ images: [] });
    }
};
