// Vercel Serverless Function - 방문자 카운터 조회
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    try {
        // CORS 헤더 설정
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // OPTIONS 요청 처리 (CORS preflight)
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // GET 요청만 허용
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // 오늘 날짜
        const today = getTodayDate();

        // Redis에서 데이터 가져오기
        let total = await kv.get('visitor_total') || 0;
        let todayCount = await kv.get(`visitor_today_${today}`) || 0;
        let lastDate = await kv.get('visitor_last_date') || today;

        // 날짜가 바뀌었으면 TODAY 리셋
        if (lastDate !== today) {
            todayCount = 0;
            await kv.set(`visitor_today_${today}`, 0);
            await kv.set('visitor_last_date', today);
            
            // 이전 날짜 데이터 삭제 (선택사항)
            if (lastDate) {
                await kv.del(`visitor_today_${lastDate}`);
            }
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
}

// 오늘 날짜 가져오기 (YYYY-MM-DD)
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


