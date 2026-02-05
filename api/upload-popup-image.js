// Vercel Serverless: POST /api/upload-popup-image (Supabase Storage 'popup' 버킷)
const { createClient } = require('@supabase/supabase-js');

const BUCKET = 'popup';

function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://xthcitqhmsjslxayhgvt.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_S3zm1hnfz6r30ntj4aUrkA_neuo-I7B';
    return createClient(supabaseUrl, supabaseKey);
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        let body = req.body;
        if (body === undefined || body === null) {
            body = {};
        } else if (Buffer.isBuffer(body)) {
            try { body = JSON.parse(body.toString('utf8')); } catch (_) { body = {}; }
        } else if (typeof body === 'string') {
            try { body = JSON.parse(body || '{}'); } catch (_) { body = {}; }
        }
        const { image: base64Input, filename } = body;
        if (!base64Input) {
            return res.status(400).json({ success: false, message: '이미지 데이터가 없습니다. (파일이 너무 크면 요청이 잘릴 수 있습니다. 2~3MB 이하로 줄여 보세요.)' });
        }
        const base64 = base64Input.replace(/^data:image\/\w+;base64,/, '');
        const buf = Buffer.from(base64, 'base64');
        const extMatch = filename && filename.match(/\.(jpe?g|png|gif|webp)$/i);
        const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
        const path = 'popup-image.' + (ext === 'jpeg' ? 'jpg' : ext);
        const contentType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

        const supabase = getSupabaseClient();
        const { data: uploadData, error } = await supabase.storage
            .from(BUCKET)
            .upload(path, buf, { contentType, upsert: true });

        if (error) {
            console.error('upload-popup-image error', error);
            return res.status(500).json({ success: false, message: error.message });
        }
        const pathUsed = typeof uploadData === 'string' ? uploadData : (uploadData && uploadData.path) || path;
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(pathUsed);
        return res.status(200).json({ success: true, url: urlData.publicUrl });
    } catch (e) {
        console.error('upload-popup-image exception', e);
        return res.status(400).json({ success: false, message: '잘못된 요청 형식' });
    }
};
