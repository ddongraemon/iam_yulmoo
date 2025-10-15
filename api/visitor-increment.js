// Vercel Serverless API: POST /api/visitor-increment
const { createClient } = require('@supabase/supabase-js');

function getTodayDate() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://xthcitqhmsjslxayhgvt.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_S3zm1hnfz6r30ntj4aUrkA_neuo-I7B';
    return createClient(supabaseUrl, supabaseKey);
}

module.exports = async (req, res) => {
    // CORS 헤더 (선택)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const supabase = getSupabaseClient();
    const today = getTodayDate();

    try {
        const { data: existing, error: selectError } = await supabase
            .from('visitor_counter')
            .select('*')
            .eq('date', today)
            .single();

        if (selectError && selectError.code !== 'PGRST116') {
            console.error('select error', selectError);
        }

        let newTotal = 1;
        let newToday = 1;

        if (existing) {
            newTotal = (existing.total || 0) + 1;
            newToday = (existing.today || 0) + 1;
            const { error: updateError } = await supabase
                .from('visitor_counter')
                .update({ total: newTotal, today: newToday, updated_at: new Date().toISOString() })
                .eq('date', today);
            if (updateError) {
                console.error('update error', updateError);
                return res.status(200).json({ total: existing.total || 0, today: existing.today || 0, date: today });
            }
        } else {
            // 오늘 레코드가 없으면 어제까지의 total을 가져와 +1로 생성
            const { data: latest } = await supabase
                .from('visitor_counter')
                .select('total')
                .order('date', { ascending: false })
                .limit(1);
            const lastTotal = latest && latest.length > 0 ? latest[0].total : 0;
            newTotal = lastTotal + 1;
            newToday = 1;

            const { error: insertError } = await supabase
                .from('visitor_counter')
                .insert({ date: today, total: newTotal, today: newToday });
            if (insertError) {
                console.error('insert error', insertError);
                return res.status(200).json({ total: lastTotal, today: 0, date: today });
            }
        }

        return res.status(200).json({ total: newTotal, today: newToday, date: today });
    } catch (e) {
        console.error('visitor-increment error', e);
        return res.status(200).json({ total: 0, today: 0, date: today, error: e.message });
    }
};
