// Vercel Serverless Function - 관리자 상태 조회 API
// Vercel 환경에 최적화된 서버 상태 모니터링

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// 환경변수
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Supabase 클라이언트
const supabase = createClient(supabaseUrl, supabaseKey);

// Vercel 환경 감지
function isVercelEnvironment() {
    return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

// Vercel 환경에 맞는 서버 상태 체크
async function checkVercelServerStatus() {
    try {
        const memory = process.memoryUsage();
        const startTime = Date.now();
        
        // Vercel 환경에서는 uptime이 의미가 없으므로 다른 방식 사용
        const environment = isVercelEnvironment() ? 'Vercel Serverless' : 'Local Server';
        
        // 메모리 사용률 계산 (Vercel 환경에 맞게 조정)
        const memoryUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;
        const rssMB = Math.round(memory.rss / 1024 / 1024);
        
        // Vercel 환경에서는 더 관대한 기준 적용
        let status = 'normal';
        let issues = [];
        
        // Vercel 환경에서는 메모리 제한이 다름 (1GB)
        if (isVercelEnvironment()) {
            if (rssMB > 800) { // 800MB 이상이면 경고
                status = 'warning';
                issues.push(`High memory usage: ${rssMB}MB`);
            }
        } else {
            // 로컬 환경 기존 기준
            if (rssMB > 500) {
                status = 'warning';
                issues.push(`High memory usage: ${rssMB}MB`);
            }
        }
        
        // 힙 사용률 체크
        if (memoryUsagePercent > 95) {
            if (status === 'normal') status = 'warning';
            issues.push(`High heap usage: ${memoryUsagePercent.toFixed(1)}%`);
        }
        
        console.log(`🔍 ${environment} 상태 체크: ${status} (RSS: ${rssMB}MB, 힙: ${memoryUsagePercent.toFixed(1)}%)`);
        if (issues.length > 0) {
            console.log(`⚠️ 서버 이슈: ${issues.join(', ')}`);
        }
        
        return {
            status: status,
            environment: environment,
            memory: memory,
            memoryFormatted: `${Math.round(memory.heapUsed / 1024 / 1024)}MB / ${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
            memoryUsagePercent: memoryUsagePercent.toFixed(1),
            rssMemoryMB: rssMB.toString(),
            uptimeFormatted: isVercelEnvironment() ? 'Serverless Function' : `${Math.round(process.uptime())}s`,
            issues: issues,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ 서버 상태 체크 실패:', error);
        return {
            status: 'error',
            environment: isVercelEnvironment() ? 'Vercel Serverless' : 'Local Server',
            memory: { heapUsed: 0, heapTotal: 0, rss: 0 },
            memoryFormatted: '알 수 없음',
            memoryUsagePercent: '0',
            rssMemoryMB: '0',
            uptimeFormatted: '알 수 없음',
            issues: ['서버 상태 체크 실패'],
            timestamp: new Date().toISOString()
        };
    }
}

// API 연결 상태 체크 (Vercel 환경에 최적화)
async function checkVercelAPIStatus() {
    const status = {
        youtube: { status: 'error' },
        instagram: { status: 'error' },
        tiktok: { status: 'error' },
        supabase: { status: 'error' }
    };

    // YouTube API 체크 - 환경변수 존재 여부로 판단
    try {
        if (process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_CHANNEL_ID) {
            status.youtube.status = 'normal';
            console.log('✅ YouTube API: 환경변수 설정 확인됨');
        } else {
            console.log('❌ YouTube API: 환경변수 미설정');
        }
    } catch (error) {
        console.log('❌ YouTube API 체크 실패:', error.message);
    }

    // Instagram API 체크
    try {
        if (process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_USER_ID) {
            status.instagram.status = 'normal';
            console.log('✅ Instagram API: 환경변수 설정 확인됨');
        } else {
            console.log('❌ Instagram API: 환경변수 미설정');
        }
    } catch (error) {
        console.log('❌ Instagram API 체크 실패:', error.message);
    }

    // TikTok API 체크
    try {
        if (process.env.TIKTOK_USERNAME && process.env.TIKTOK_ACCESS_TOKEN) {
            status.tiktok.status = 'normal';
            console.log('✅ TikTok API: 환경변수 설정 확인됨');
        } else {
            console.log('❌ TikTok API: 환경변수 미설정');
        }
    } catch (error) {
        console.log('❌ TikTok API 체크 실패:', error.message);
    }

    // Supabase 연결 체크
    try {
        const { data, error } = await supabase
            .from('visitor_counter')
            .select('count')
            .limit(1);
        
        if (!error) {
            status.supabase.status = 'normal';
            console.log('✅ Supabase 연결 정상');
        } else {
            console.log('❌ Supabase 연결 실패:', error.message);
        }
    } catch (error) {
        console.log('❌ Supabase 연결 체크 실패:', error.message);
    }

    return status;
}

// 마지막 동기화 시간 조회 (Vercel 환경에 최적화)
async function getVercelLastSyncTimes() {
    try {
        // Vercel KV 또는 Supabase에서 마지막 동기화 시간 조회
        const { data, error } = await supabase
            .from('settings')
            .select('value, updated_at')
            .in('key', ['last_youtube_sync', 'last_instagram_sync', 'last_tiktok_sync']);
        
        if (error) {
            console.log('❌ 동기화 시간 조회 실패:', error.message);
            return {
                youtube: '알 수 없음',
                instagram: '알 수 없음',
                tiktok: '알 수 없음'
            };
        }
        
        const syncTimes = {
            youtube: '알 수 없음',
            instagram: '알 수 없음',
            tiktok: '알 수 없음'
        };
        
        data.forEach(item => {
            if (item.key === 'last_youtube_sync') {
                syncTimes.youtube = item.updated_at ? new Date(item.updated_at).toLocaleString('ko-KR') : '알 수 없음';
            } else if (item.key === 'last_instagram_sync') {
                syncTimes.instagram = item.updated_at ? new Date(item.updated_at).toLocaleString('ko-KR') : '알 수 없음';
            } else if (item.key === 'last_tiktok_sync') {
                syncTimes.tiktok = item.updated_at ? new Date(item.updated_at).toLocaleString('ko-KR') : '알 수 없음';
            }
        });
        
        return syncTimes;
    } catch (error) {
        console.error('❌ 동기화 시간 조회 중 오류:', error);
        return {
            youtube: '알 수 없음',
            instagram: '알 수 없음',
            tiktok: '알 수 없음'
        };
    }
}

// 방문자 통계 조회 (Vercel 환경에 최적화)
async function getVercelVisitorStats(days = 14) {
    try {
        const { data, error } = await supabase
            .from('visitor_counter')
            .select('*')
            .order('date', { ascending: false })
            .limit(days);
        
        if (error) {
            console.error('❌ 방문자 통계 조회 실패:', error);
            return { data: [], total: 0 };
        }
        
        const total = data.length > 0 ? data[0].total : 0;
        console.log(`✅ 방문자 통계 조회 성공: ${data.length}일 데이터, 총 ${total}명`);
        
        return { data, total };
    } catch (error) {
        console.error('❌ 방문자 통계 조회 중 오류:', error);
        return { data: [], total: 0 };
    }
}

// 스케줄러 상태 조회
async function getVercelSchedulerStatus() {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'scheduler_active')
            .single();
        
        const active = data ? data.value === 'true' : true;
        
        // 다음 실행 시간 계산 (Vercel Cron Jobs 기준)
        const now = new Date();
        const next21 = new Date(now);
        next21.setHours(21, 0, 0, 0);
        
        if (next21 <= now) {
            next21.setDate(next21.getDate() + 1);
        }
        
        return {
            active: active,
            nextRun: next21.toLocaleString('ko-KR'),
            environment: isVercelEnvironment() ? 'Vercel Cron Jobs' : 'Local Cron'
        };
    } catch (error) {
        console.error('❌ 스케줄러 상태 조회 실패:', error);
        return {
            active: true,
            nextRun: '알 수 없음',
            environment: isVercelEnvironment() ? 'Vercel Cron Jobs' : 'Local Cron'
        };
    }
}

// Vercel 환경에 최적화된 관리자 상태 조회
async function getVercelAdminStatus() {
    try {
        console.log('🔍 Vercel 환경 관리자 상태 조회 시작');
        
        // 서버 상태 체크
        const serverStatus = await checkVercelServerStatus();

        // API 연결 상태 체크
        const apiStatus = await checkVercelAPIStatus();

        // 마지막 동기화 시간
        const syncTimes = await getVercelLastSyncTimes();

        // 방문자 통계 (14일)
        const visitorStatsResult = await getVercelVisitorStats(14);

        // 스케줄러 상태
        const schedulerStatus = await getVercelSchedulerStatus();

        return {
            server: serverStatus,
            apis: apiStatus,
            syncTimes: syncTimes,
            visitorStats: visitorStatsResult.data,
            totalVisitors: visitorStatsResult.total,
            scheduler: schedulerStatus,
            environment: isVercelEnvironment() ? 'Vercel Serverless' : 'Local Server'
        };
    } catch (error) {
        console.error('❌ Vercel 관리자 상태 조회 오류:', error);
        throw error;
    }
}

// Vercel API 핸들러
module.exports = async (req, res) => {
    try {
        // CORS 헤더 설정
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }
        
        if (req.method !== 'GET') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        
        console.log('🕘 Vercel 관리자 상태 조회 API 호출');
        
        const adminStatus = await getVercelAdminStatus();
        
        res.status(200).json({
            success: true,
            data: adminStatus,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Vercel 관리자 상태 조회 API 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};
