// Vercel: GET /api/gallery?year=2026|2025|2024|2023|all
// images/gallery 폴더의 연도별 이미지 목록 반환
const path = require('path');
const fs = require('fs');

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

function getGalleryDir() {
    return path.join(process.cwd(), 'images', 'gallery');
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const yearParam = (req.query && req.query.year) || 'all';
    const galleryDir = getGalleryDir();
    const images = [];

    try {
        if (!fs.existsSync(galleryDir)) {
            return res.status(200).json({ images: [] });
        }

        const yearsToRead = yearParam === 'all'
            ? fs.readdirSync(galleryDir, { withFileTypes: true })
                .filter(d => d.isDirectory() && /^\d{4}$/.test(d.name))
                .map(d => d.name)
                .sort((a, b) => Number(b) - Number(a))
            : [yearParam];

        for (const year of yearsToRead) {
            const yearPath = path.join(galleryDir, year);
            if (!fs.existsSync(yearPath) || !fs.statSync(yearPath).isDirectory()) continue;
            const files = fs.readdirSync(yearPath);
            for (const name of files) {
                const ext = path.extname(name).toLowerCase();
                if (IMAGE_EXTS.includes(ext)) {
                    images.push({
                        image_url: `/images/gallery/${year}/${encodeURIComponent(name)}`,
                        file_name: name,
                        year: year
                    });
                }
            }
        }

        images.sort((a, b) => (b.year + b.file_name).localeCompare(a.year + a.file_name));
    } catch (err) {
        console.warn('gallery API error:', err.message);
    }

    return res.status(200).json({ images });
};
