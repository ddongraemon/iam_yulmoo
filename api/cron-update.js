// Vercel Cron Job - 6시간마다 YouTube 데이터 업데이트
// 이 함수는 Vercel의 Cron Jobs 기능으로 자동 실행됩니다

export default async function handler(req, res) {
    // Cron job 인증 확인 (Vercel에서만 호출 가능)
    if (req.headers['x-vercel-cron-id']) {
        console.log('✅ Cron job 실행됨:', new Date().toISOString());
        
        try {
            // TODO: YouTube API 데이터 가져오기 및 저장 로직
            // 현재는 로그만 남김
            console.log('📺 YouTube 데이터 업데이트 예정');
            
            return res.status(200).json({ 
                success: true,
                message: 'Cron job executed successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Cron job 실행 오류:', error);
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    } else {
        // Cron job이 아닌 일반 요청은 거부
        return res.status(401).json({ 
            error: 'Unauthorized - This endpoint is only for Vercel Cron Jobs' 
        });
    }
}

