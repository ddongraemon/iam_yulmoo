// Vercel Serverless Function - 방문자 카운터 증가
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    try {
        // CORS 헤더 설정
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // OPTIONS 요청 처리 (CORS preflight)
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // POST 요청만 허용
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // 오늘 날짜
        const today = getTodayDate();

        // Redis에서 현재 데이터 가져오기
        let total = await kv.get('visitor_total') || 0;
        let todayCount = await kv.get(`visitor_today_${today}`) || 0;
        let lastDate = await kv.get('visitor_last_date') || today;

        // 날짜가 바뀌었으면 TODAY 리셋
        if (lastDate !== today) {
            todayCount = 0;
            await kv.set('visitor_last_date', today);
            
            // 이전 날짜 데이터 삭제
            if (lastDate) {
                await kv.del(`visitor_today_${lastDate}`);
            }
        }

        // 카운터 증가
        total = Number(total) + 1;
        todayCount = Number(todayCount) + 1;

        // Redis에 저장
        await kv.set('visitor_total', total);
        await kv.set(`visitor_today_${today}`, todayCount);

        console.log(`✅ 방문자 증가: TOTAL ${total}, TODAY ${todayCount}`);

        return res.status(200).json({
            total: total,
            today: todayCount,
            date: today
        });

    } catch (error) {
        console.error('방문자 카운터 증가 오류:', error);
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

