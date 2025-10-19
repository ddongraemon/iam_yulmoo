// Vercel Cron Jobs - 일일 카카오톡 알림 발송
// 매일 한국시간 21시 (UTC 12시)에 실행

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const crypto = require('crypto');

// 환경변수
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY;

// Supabase 클라이언트
const supabase = createClient(supabaseUrl, supabaseKey);

// 토큰 복호화 함수
function decryptToken(encryptedToken) {
    if (!encryptedToken) return null;
    try {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(process.env.SUPABASE_ANON_KEY || 'default-key', 'salt', 32);
        const parts = encryptedToken.split(':');
        if (parts.length !== 2) throw new Error('Invalid encrypted token format');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('❌ 토큰 복호화 실패:', error.message);
        return null;
    }
}

// 스케줄러 상태 로드
async function loadSchedulerStatus() {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'scheduler_active')
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('❌ 스케줄러 상태 로드 실패:', error);
            return true; // 기본값: 활성화
        }
        
        return data ? data.value === 'true' : true;
    } catch (error) {
        console.error('❌ 스케줄러 상태 로드 중 오류:', error);
        return true; // 기본값: 활성화
    }
}

// 카카오 사용자 토큰 로드
async function loadKakaoUsersFromDB() {
    try {
        const { data, error } = await supabase
            .from('kakao_users')
            .select('*')
            .order('updated_at', { ascending: false });
        
        if (error) {
            console.error('❌ 카카오 사용자 토큰 로드 실패:', error);
            return [];
        }
        
        return data.map(user => ({
            userId: user.user_id,
            nickname: user.nickname,
            accessToken: decryptToken(user.access_token),
            refreshToken: decryptToken(user.refresh_token_encrypted),
            loginTime: user.login_time
        }));
    } catch (error) {
        console.error('❌ 카카오 사용자 토큰 로드 중 오류:', error);
        return [];
    }
}

// 토큰 갱신
async function refreshUserToken(userId, refreshToken) {
    try {
        console.log(`🔄 ${userId}의 토큰 갱신 시도...`);
        const response = await axios.post('https://kauth.kakao.com/oauth/token',
            `grant_type=refresh_token&client_id=${kakaoRestApiKey}&refresh_token=${refreshToken}`,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        
        if (response.data.access_token) {
            console.log(`✅ ${userId}의 토큰 갱신 완료`);
            return response.data.access_token;
        } else {
            console.error(`❌ ${userId}의 토큰 갱신 응답에 액세스 토큰이 없습니다.`);
            return null;
        }
    } catch (error) {
        console.error(`❌ ${userId}의 토큰 갱신 실패:`, error.response?.data || error.message);
        return null;
    }
}

// 카카오톡 메시지 발송
async function sendKakaoMessage(accessToken, message) {
    try {
        const response = await axios.post('https://kapi.kakao.com/v2/api/talk/memo/default/send',
            { template_object: JSON.stringify({
                object_type: 'text',
                text: message,
                link: {
                    web_url: 'https://iam-yulmoo.vercel.app',
                    mobile_web_url: 'https://iam-yulmoo.vercel.app'
                }
            })},
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        return response.data.result_code === 0;
    } catch (error) {
        console.error('❌ 카카오톡 메시지 발송 실패:', error.response?.data || error.message);
        return false;
    }
}

// 일일 알림 발송
async function sendDailyNotification() {
    try {
        console.log('🕘 === 일일 카카오톡 알림 발송 시작 ===');
        
        // 스케줄러 상태 확인
        const schedulerActive = await loadSchedulerStatus();
        if (!schedulerActive) {
            console.log('⏸️ 스케줄러가 비활성화되어 있습니다. 알림 발송을 건너뜁니다.');
            return { success: true, message: '스케줄러 비활성화로 인해 알림 발송 건너뜀' };
        }
        
        // 카카오 사용자 토큰 로드
        const kakaoUsers = await loadKakaoUsersFromDB();
        if (kakaoUsers.length === 0) {
            console.log('⚠️ 등록된 카카오 사용자가 없습니다.');
            return { success: true, message: '등록된 카카오 사용자 없음' };
        }
        
        console.log(`📱 ${kakaoUsers.length}명의 사용자에게 알림 발송 시도`);
        
        // 일일 알림 메시지
        const today = new Date();
        const kstTime = new Date(today.getTime() + (9 * 60 * 60 * 1000));
        const dateStr = kstTime.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        });
        
        const message = `🌟 율무의 일일 알림 🌟\n\n안녕하세요! ${dateStr}입니다.\n\n오늘도 율무와 함께 즐거운 하루 보내세요! 🐾\n\n새로운 영상과 소식이 업데이트되었는지 확인해보세요!\n\n👉 https://iam-yulmoo.vercel.app`;
        
        let successCount = 0;
        let failCount = 0;
        
        // 각 사용자에게 메시지 발송
        for (const user of kakaoUsers) {
            try {
                let accessToken = user.accessToken;
                
                // 토큰 발송 시도
                let sendSuccess = await sendKakaoMessage(accessToken, message);
                
                // 토큰 만료 시 갱신 후 재시도
                if (!sendSuccess && user.refreshToken) {
                    console.log(`🔄 ${user.nickname}의 토큰 갱신 후 재시도...`);
                    const newAccessToken = await refreshUserToken(user.userId, user.refreshToken);
                    if (newAccessToken) {
                        sendSuccess = await sendKakaoMessage(newAccessToken, message);
                    }
                }
                
                if (sendSuccess) {
                    console.log(`✅ ${user.nickname}에게 메시지 전송 성공`);
                    successCount++;
                } else {
                    console.log(`❌ ${user.nickname}에게 메시지 전송 실패`);
                    failCount++;
                }
            } catch (error) {
                console.error(`❌ ${user.nickname}에게 메시지 전송 중 오류:`, error.message);
                failCount++;
            }
        }
        
        const result = {
            success: true,
            message: `일일 알림 발송 완료: 성공 ${successCount}명, 실패 ${failCount}명`,
            successCount,
            failCount,
            totalUsers: kakaoUsers.length
        };
        
        console.log('🎉 === 일일 카카오톡 알림 발송 완료 ===');
        console.log(`📊 결과: 성공 ${successCount}명, 실패 ${failCount}명`);
        
        return result;
        
    } catch (error) {
        console.error('❌ 일일 알림 발송 중 오류:', error);
        return {
            success: false,
            message: `일일 알림 발송 실패: ${error.message}`,
            error: error.message
        };
    }
}

// Vercel API 핸들러
module.exports = async (req, res) => {
    try {
        // Vercel Cron Jobs에서만 실행되도록 보안 체크
        const authHeader = req.headers.authorization;
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        console.log('🕘 Vercel Cron Job - 일일 카카오톡 알림 발송 시작');
        
        const result = await sendDailyNotification();
        
        res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            result
        });
        
    } catch (error) {
        console.error('❌ Vercel Cron Job 실행 중 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};
