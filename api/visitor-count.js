// Vercel Serverless Function - Supabase 기반 방문자 카운터 조회
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xthcitqhmsjslxayhgvt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0aGNpdHFobXNqc2x4YXloZ3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg2MjE2OTMsImV4cCI6MjA0NDE5NzY5M30.lKzDVLhкойJ3_9-Y-bTHH-IbqEgw5dT_d2WiP6c1JQ';

module.exports = async (req, res) => {
    try {
        // CORS 헤더 설정
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // OPTIONS 요청 처리
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // GET 요청만 허용
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const today = getTodayDate();

        // 전체 방문자 수 조회
        const { data: totalData } = await supabase
            .from('visitor_stats')
            .select('stat_value')
            .eq('stat_key', 'total')
            .single();

        // 오늘 방문자 수 조회
        const { data: todayData } = await supabase
            .from('visitor_stats')
            .select('stat_value')
            .eq('stat_key', `today_${today}`)
            .single();

        // 마지막 날짜 조회
        const { data: lastDateData } = await supabase
            .from('visitor_stats')
            .select('stat_value')
            .eq('stat_key', 'last_date')
            .single();

        let total = totalData?.stat_value || 0;
        let todayCount = todayData?.stat_value || 0;
        let lastDate = lastDateData?.stat_value || today;

        // 날짜가 바뀌었으면 TODAY 리셋
        if (lastDate !== today) {
            todayCount = 0;
            
            // 오늘 데이터 초기화
            await supabase
                .from('visitor_stats')
                .upsert({ 
                    stat_key: `today_${today}`, 
                    stat_value: 0,
                    updated_at: new Date().toISOString()
                });

            // 마지막 날짜 업데이트
            await supabase
                .from('visitor_stats')
                .upsert({ 
                    stat_key: 'last_date', 
                    stat_value: today,
                    updated_at: new Date().toISOString()
                });
        }

        return res.status(200).json({
            total: Number(total),
            today: Number(todayCount),
            date: today
        });

    } catch (error) {
        console.error('방문자 카운터 조회 오류:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
};

// 오늘 날짜 가져오기 (YYYY-MM-DD)
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
