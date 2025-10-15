// Vercel Serverless API: GET /api/visitor-count
const { createClient } = require('@supabase/supabase-js');

function getTodayDate() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function getSupabaseClient() {
    // 환경변수가 없어도 기본값으로 동작하도록 수정
    const supabaseUrl = process.env.SUPABASE_URL || 'https://xthcitqhmsjslxayhgvt.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_S3zm1hnfz6r30ntj4aUrkA_neuo-I7B';
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key:', supabaseKey.substring(0, 20) + '...');
    
    return createClient(supabaseUrl, supabaseKey);
}

module.exports = async (req, res) => {
    console.log('=== visitor-count API 호출 시작 ===');
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const supabase = getSupabaseClient();
    const today = getTodayDate();
    
    console.log('Today date:', today);

    try {
        // 오늘 레코드가 없으면 생성 (total은 직전 total 유지)
        const { data: existing, error: selectError } = await supabase
            .from('visitor_counter')
            .select('*')
            .eq('date', today)
            .single();

        if (selectError && selectError.code !== 'PGRST116') {
            console.error('select error', selectError);
        }

        if (!existing) {
            // 직전 total 가져오기
            const { data: latest, error: latestError } = await supabase
                .from('visitor_counter')
                .select('total')
                .order('date', { ascending: false })
                .limit(1);

            const lastTotal = latest && latest.length > 0 ? latest[0].total : 0;
            const { error: insertError } = await supabase
                .from('visitor_counter')
                .insert({ date: today, total: lastTotal, today: 0 });
            if (insertError) {
                console.error('insert error', insertError);
            }
        }

        const { data, error } = await supabase
            .from('visitor_counter')
            .select('*')
            .eq('date', today)
            .single();

        if (error) {
            console.error('fetch error', error);
            return res.status(200).json({ total: 0, today: 0, date: today });
        }

        console.log('Success response:', { total: data.total, today: data.today, date: data.date });
        return res.status(200).json({
            total: data.total || 0,
            today: data.today || 0,
            date: data.date
        });
    } catch (e) {
        console.error('=== visitor-count API 에러 ===');
        console.error('Error message:', e.message);
        console.error('Error stack:', e.stack);
        console.error('Full error:', e);
        return res.status(200).json({ 
            total: 0, 
            today: 0, 
            date: today,
            error: e.message 
        });
    }
};