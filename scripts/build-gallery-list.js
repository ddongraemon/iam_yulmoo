// 빌드 시 images/gallery 폴더를 읽어 api/gallery-data.json 생성
// Vercel 함수가 이미지 폴더를 번들하지 않도록 하기 위함
const path = require('path');
const fs = require('fs');

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const galleryDir = path.join(process.cwd(), 'images', 'gallery');
const outPath = path.join(process.cwd(), 'api', 'gallery-data.json');

const images = [];

try {
    if (!fs.existsSync(galleryDir)) {
        fs.writeFileSync(outPath, JSON.stringify({ images: [] }, null, 0));
        process.exit(0);
    }

    const yearDirs = fs.readdirSync(galleryDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && /^\d{4}$/.test(d.name))
        .map(d => d.name)
        .sort((a, b) => Number(b) - Number(a));

    for (const year of yearDirs) {
        const yearPath = path.join(galleryDir, year);
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
    fs.writeFileSync(outPath, JSON.stringify({ images }, null, 0));
} catch (err) {
    console.error('build-gallery-list error:', err.message);
    fs.writeFileSync(outPath, JSON.stringify({ images: [] }, null, 0));
}

console.log('gallery-data.json created with', images.length, 'images');
