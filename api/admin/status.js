// Vercel Serverless API: GET /api/admin/status
// admin.html의 일일 방문자 통계를 위해 Supabase visitor_counter에서 최근 14일 데이터를 가져옵니다.

const { createClient } = require('@supabase/supabase-js');

function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://xthcitqhmsjslxayhgvt.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_S3zm1hnfz6r30ntj4aUrkA_neuo-I7B';
    return createClient(supabaseUrl, supabaseKey);
}

// 방문자 통계 조회 (서버.js의 getVisitorStats를 간단히 재구현)
async function getVisitorStats(supabase, days = 14) {
    try {
        // 기존 서버 로직을 따라 2025-10-18 이후 데이터만 사용
        const startDate = '2025-10-18';

        const { data, error } = await supabase
            .from('visitor_counter')
            .select('date, today')
            .gte('date', startDate)
            .order('date', { ascending: false })
            .limit(days);

        if (error) {
            console.error('admin/status 방문자 통계 조회 오류:', error);
            return { data: [], total: 0 };
        }

        if (data && data.length > 0) {
            const startDateObj = new Date(startDate);
            const filtered = data.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= startDateObj;
            });
            const total = filtered.reduce((sum, item) => sum + (item.today || 0), 0);
            return { data: filtered.reverse(), total };
        }

        return { data: [], total: 0 };
    } catch (e) {
        console.error('admin/status 방문자 통계 조회 예외:', e);
        return { data: [], total: 0 };
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const supabase = getSupabaseClient();

    try {
        const visitorStatsResult = await getVisitorStats(supabase, 14);

        // admin.html은 visitorStats, totalVisitors만 사용하지만
        // 나중을 위해 server/apis/scheduler 필드도 형식만 맞춰서 내려줌
        const payload = {
            server: {
                status: 'unknown',
                uptime: 0,
                uptimeFormatted: '',
                memory: 0,
                memoryFormatted: ''
            },
            apis: {
                youtube: { status: 'unknown' },
                instagram: { status: 'unknown' },
                tiktok: { status: 'unknown' },
                supabase: { status: 'normal' }
            },
            syncTimes: {
                youtube: null,
                instagram: null,
                tiktok: null
            },
            visitorStats: visitorStatsResult.data,
            totalVisitors: visitorStatsResult.total,
            scheduler: {
                active: null,
                nextRun: null
            }
        };

        return res.status(200).json(payload);
    } catch (e) {
        console.error('admin/status API 오류:', e);
        return res.status(500).json({ error: 'admin status fetch failed' });
    }
};

