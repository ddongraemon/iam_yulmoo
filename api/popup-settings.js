// Vercel Serverless API: GET/POST /api/popup-settings (Supabase popup_settings)
const { createClient } = require('@supabase/supabase-js');

function getTodayDateKST() {
    const now = new Date();
    const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const y = kst.getUTCFullYear();
    const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
    const d = String(kst.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://xthcitqhmsjslxayhgvt.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_S3zm1hnfz6r30ntj4aUrkA_neuo-I7B';
    return createClient(supabaseUrl, supabaseKey);
}

const defaultPayload = {
    enabled: false,
    start_date: null,
    end_date: null,
    image_url: '',
    link_url: '',
    version: 0
};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
        res.setHeader('Allow', 'GET, POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const supabase = getSupabaseClient();

    try {
        if (req.method === 'GET') {
            const { data, error } = await supabase
                .from('popup_settings')
                .select('enabled, start_date, end_date, image_url, link_url, version')
                .eq('id', 1)
                .single();

            if (error) {
                console.error('popup-settings GET error', error);
                return res.status(200).json(defaultPayload);
            }

            const today = getTodayDateKST();
            const enabled = data?.enabled ?? false;
            const endDate = data?.end_date ?? null;
            const expired = enabled && endDate && today > endDate;

            if (expired) {
                await supabase
                    .from('popup_settings')
                    .update({ enabled: false, updated_at: new Date().toISOString() })
                    .eq('id', 1);
            }

            return res.status(200).json({
                enabled: expired ? false : enabled,
                start_date: data?.start_date ?? null,
                end_date: endDate,
                image_url: data?.image_url ?? '',
                link_url: data?.link_url ?? '',
                version: data?.version ?? 0
            });
        }

        // POST (enabled 켤 때 version 갱신 → 클라이언트 24시간 보지않기 초기화)
        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
        const { enabled, start_date, end_date, image_url, link_url } = body;
        const isEnabled = Boolean(enabled);
        const row = {
            id: 1,
            enabled: isEnabled,
            start_date: start_date || null,
            end_date: end_date || null,
            image_url: image_url || '',
            link_url: link_url || '',
            updated_at: new Date().toISOString()
        };
        if (isEnabled) row.version = Math.floor(Date.now() / 1000);

        const { error } = await supabase
            .from('popup_settings')
            .upsert(row, { onConflict: 'id' });

        if (error) {
            console.error('popup-settings POST error', error);
            return res.status(500).json({ success: false, message: error.message });
        }

        return res.status(200).json({ success: true, message: '팝업 설정이 저장되었습니다.' });
    } catch (e) {
        console.error('popup-settings error', e);
        if (req.method === 'GET') {
            return res.status(200).json(defaultPayload);
        }
        return res.status(400).json({ success: false, message: '잘못된 요청 형식' });
    }
};
