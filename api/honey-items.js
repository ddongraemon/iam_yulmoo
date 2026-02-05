// Vercel: GET/POST /api/honey-items
const { createClient } = require('@supabase/supabase-js');

function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://xthcitqhmsjslxayhgvt.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_S3zm1hnfz6r30ntj4aUrkA_neuo-I7B';
    return createClient(supabaseUrl, supabaseKey);
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET' && req.method !== 'POST') {
        res.setHeader('Allow', 'GET, POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const supabase = getSupabaseClient();

    try {
        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('honey_items')
                .select('id, image_url, link_url, tags, description')
                .order('id', { ascending: true });

            if (error) {
                console.error('honey-items GET error', error);
                return res.status(200).json([]);
            }
            const items = (data || []).map(row => ({
                id: row.id,
                image_url: row.image_url || '',
                link_url: row.link_url || '',
                tags: row.tags || '[]',
                description: row.description || ''
            }));
            return res.status(200).json(items);
        }

        const body = typeof req.body === 'string' ? JSON.parse(req.body || '[]') : (req.body || []);
        const items = Array.isArray(body) ? body : [];
        if (items.length === 0) return res.status(400).json({ success: false, message: '항목 배열이 필요합니다.' });

        for (const item of items) {
            if (item.id == null || item.id < 1 || item.id > 6) continue;
            await supabase.from('honey_items').upsert({
                id: item.id,
                image_url: item.image_url || '',
                link_url: item.link_url || '',
                tags: typeof item.tags === 'string' ? item.tags : JSON.stringify(item.tags || []),
                description: item.description || '',
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
        }
        return res.status(200).json({ success: true, message: '꿀템추천 설정이 저장되었습니다.' });
    } catch (e) {
        console.error('honey-items error', e);
        if (req.method === 'GET') return res.status(200).json([]);
        return res.status(400).json({ success: false, message: '잘못된 요청 형식' });
    }
};
