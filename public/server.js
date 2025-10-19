require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const port = process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.SUPABASE_URL || 'https://xthcitqhmsjslxayhgvt.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_S3zm1hnfz6r30ntj4aUrkA_neuo-I7B';
const supabase = createClient(supabaseUrl, supabaseKey);

// API 설정
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME;
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg'
};

// 캐시 파일 경로
const YOUTUBE_CACHE_FILE = path.join(__dirname, 'youtube-data.json');
const SOCIAL_STATS_CACHE_FILE = path.join(__dirname, 'social-stats.json');

// 채널 ID 캐시
let cachedChannelId = null;

// ========================================
// 방문자 카운터 시스템 (Supabase 연동)
// ========================================

// 오늘 날짜 가져오기 (한국시간 KST 기준, YYYY-MM-DD)
function getTodayDate() {
    const now = new Date();
    // UTC 시간에 9시간을 더해서 한국시간(KST)으로 변환
    const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const year = kstTime.getUTCFullYear();
    const month = String(kstTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(kstTime.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 방문자 카운터 초기화 (Supabase)
async function initVisitorCounter() {
    try {
        const today = getTodayDate();
        
        // 오늘 날짜의 레코드가 있는지 확인
        const { data: existingRecord, error: selectError } = await supabase
            .from('visitor_counter')
            .select('*')
            .eq('date', today)
            .single();
        
        if (selectError && selectError.code !== 'PGRST116') { // PGRST116은 "no rows returned" 에러
            console.error('❌ 방문자 카운터 초기화 오류:', selectError);
            return;
        }
        
        // 오늘 날짜의 레코드가 없으면 생성
        if (!existingRecord) {
            // 전체 총합 계산
            const { data: allRecords, error: sumError } = await supabase
                .from('visitor_counter')
                .select('total')
                .order('date', { ascending: false })
                .limit(1);
            
            let totalCount = 0;
            if (allRecords && allRecords.length > 0) {
                totalCount = allRecords[0].total;
            }
            
            const { error: insertError } = await supabase
                .from('visitor_counter')
                .insert({
                    date: today,
                    total: totalCount,
                    today: 0
                });
            
            if (insertError) {
                console.error('❌ 방문자 카운터 초기화 오류:', insertError);
            } else {
                console.log(`✅ 방문자 카운터 초기화 완료 (${today})`);
            }
        } else {
            console.log(`✅ 방문자 카운터 이미 존재 (${today})`);
        }
    } catch (error) {
        console.error('❌ 방문자 카운터 초기화 중 오류:', error);
    }
}

// 방문자 카운터 읽기 (Supabase)
async function getVisitorCounter() {
    try {
        const today = getTodayDate();
        
        const { data, error } = await supabase
            .from('visitor_counter')
            .select('*')
            .eq('date', today)
            .single();
        
        if (error) {
            console.error('❌ 방문자 카운터 조회 오류:', error);
            return { total: 0, today: 0, date: today };
        }
        
        return {
            total: data.total || 0,
            today: data.today || 0,
            date: data.date
        };
    } catch (error) {
        console.error('❌ 방문자 카운터 조회 중 오류:', error);
        return { total: 0, today: 0, date: getTodayDate() };
    }
}

// 방문자 증가 (Supabase)
async function incrementVisitor() {
    try {
        const today = getTodayDate();
        
        // 오늘 날짜의 레코드 조회
        const { data: existingRecord, error: selectError } = await supabase
            .from('visitor_counter')
            .select('*')
            .eq('date', today)
            .single();
        
        if (selectError && selectError.code !== 'PGRST116') {
            console.error('❌ 방문자 카운터 조회 오류:', selectError);
            return { total: 0, today: 0, date: today };
        }
        
        let newTotal, newToday;
        
        if (existingRecord) {
            // 기존 레코드 업데이트
            newTotal = existingRecord.total + 1;
            newToday = existingRecord.today + 1;
            
            const { error: updateError } = await supabase
                .from('visitor_counter')
                .update({
                    total: newTotal,
                    today: newToday,
                    updated_at: new Date().toISOString()
                })
                .eq('date', today);
            
            if (updateError) {
                console.error('❌ 방문자 카운터 업데이트 오류:', updateError);
                return { total: existingRecord.total, today: existingRecord.today, date: today };
            }
        } else {
            // 새 레코드 생성
            newTotal = 1;
            newToday = 1;
            
            const { error: insertError } = await supabase
                .from('visitor_counter')
                .insert({
                    date: today,
                    total: newTotal,
                    today: newToday
                });
            
            if (insertError) {
                console.error('❌ 방문자 카운터 생성 오류:', insertError);
                return { total: 0, today: 0, date: today };
            }
        }
        
        console.log(`📊 방문자 카운터 증가: TOTAL ${newTotal}명, TODAY ${newToday}명`);
        return { total: newTotal, today: newToday, date: today };
        
    } catch (error) {
        console.error('❌ 방문자 카운터 증가 중 오류:', error);
        return { total: 0, today: 0, date: getTodayDate() };
    }
}

// 방문자 카운터 초기화 (비동기)
initVisitorCounter();

// ========================================
// YouTube API
// ========================================

// 핸들에서 채널 ID 찾기
async function getChannelIdFromHandle(handle) {
    try {
        const cleanHandle = handle.replace('@', '');
        const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: cleanHandle,
                type: 'channel',
                maxResults: 1,
                key: YOUTUBE_API_KEY
            }
        });
        
        if (searchResponse.data.items && searchResponse.data.items.length > 0) {
            const channelId = searchResponse.data.items[0].snippet.channelId;
            console.log(`✅ YouTube 채널 ID 찾기 성공: ${handle} -> ${channelId}`);
            return channelId;
        }
        
        throw new Error(`채널을 찾을 수 없습니다: ${handle}`);
    } catch (error) {
        console.error('❌ 채널 ID 검색 오류:', error.response?.data || error.message);
        throw error;
    }
}

// YouTube API 호출 함수
async function fetchYouTubeData() {
    try {
        console.log('📺 YouTube API 데이터 가져오기 시작...');
        
        if (!cachedChannelId) {
            console.log(`  채널 ID 검색 중: ${YOUTUBE_CHANNEL_ID}`);
            cachedChannelId = await getChannelIdFromHandle(YOUTUBE_CHANNEL_ID);
        }
        
        // 1. 채널 통계 정보 가져오기 (구독자, 총 영상 수, 총 조회수)
        const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
                part: 'statistics,snippet',
                id: cachedChannelId,
                key: YOUTUBE_API_KEY
            }
        });

        if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
            throw new Error(`채널 정보를 가져올 수 없습니다: ${cachedChannelId}`);
        }

        const channelData = channelResponse.data.items[0];
        const subscriberCount = parseInt(channelData.statistics.subscriberCount);
        const videoCount = parseInt(channelData.statistics.videoCount);
        const viewCount = parseInt(channelData.statistics.viewCount);

        // 2. 조회수가 높은 영상 3개 가져오기
        const popularVideosResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                channelId: cachedChannelId,
                order: 'viewCount',
                type: 'video',
                maxResults: 3,
                key: YOUTUBE_API_KEY
            }
        });

        // 3. 최신 업로드 영상 3개 가져오기
        const recentVideosResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                channelId: cachedChannelId,
                order: 'date',
                type: 'video',
                maxResults: 3,
                key: YOUTUBE_API_KEY
            }
        });

        // 4. 영상 상세 정보 가져오기
        const popularVideoIds = popularVideosResponse.data.items.map(item => item.id.videoId).join(',');
        const recentVideoIds = recentVideosResponse.data.items.map(item => item.id.videoId).join(',');
        const allVideoIds = `${popularVideoIds},${recentVideoIds}`;

        const videoDetailsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'contentDetails,statistics,snippet',
                id: allVideoIds,
                key: YOUTUBE_API_KEY
            }
        });

        const videoDetailsMap = {};
        videoDetailsResponse.data.items.forEach(video => {
            videoDetailsMap[video.id] = video;
        });

        // 데이터 포맷팅
        const formatVideoData = (searchItem) => {
            const videoId = searchItem.id.videoId;
            const details = videoDetailsMap[videoId];
            
            return {
                videoId: videoId,
                title: searchItem.snippet.title,
                thumbnail: searchItem.snippet.thumbnails.high.url,
                duration: formatDuration(details.contentDetails.duration),
                viewCount: formatNumber(details.statistics.viewCount),
                likeCount: formatNumber(details.statistics.likeCount || 0),
                commentCount: formatNumber(details.statistics.commentCount || 0),
                publishedAt: searchItem.snippet.publishedAt,
                url: `https://www.youtube.com/watch?v=${videoId}`
            };
        };

        const youtubeData = {
            channelInfo: {
                subscriberCount: formatNumber(subscriberCount),
                subscriberCountRaw: subscriberCount,
                videoCount: formatNumber(videoCount),
                videoCountRaw: videoCount,
                viewCount: formatNumber(viewCount),
                viewCountRaw: viewCount,
                lastUpdate: new Date().toISOString()
            },
            popularVideos: popularVideosResponse.data.items.map(formatVideoData),
            recentVideos: recentVideosResponse.data.items.map(formatVideoData)
        };

        // 캐시 파일에 저장
        fs.writeFileSync(YOUTUBE_CACHE_FILE, JSON.stringify(youtubeData, null, 2), 'utf8');
        console.log('✅ YouTube 데이터 업데이트 완료');
        
        return youtubeData;
    } catch (error) {
        console.error('❌ YouTube API 호출 오류:', error.response?.data || error.message);
        
        if (fs.existsSync(YOUTUBE_CACHE_FILE)) {
            console.log('⚠️  캐시된 YouTube 데이터를 사용합니다.');
            return JSON.parse(fs.readFileSync(YOUTUBE_CACHE_FILE, 'utf8'));
        }
        
        return null;
    }
}

// ========================================
// Instagram Graph API
// ========================================

async function fetchInstagramData() {
    try {
        console.log('📷 Instagram API 데이터 가져오기 시작...');
        
        if (!INSTAGRAM_USER_ID || !INSTAGRAM_ACCESS_TOKEN) {
            throw new Error('Instagram 인증 정보가 없습니다.');
        }

        // 1. 계정 정보 및 통계 가져오기
        const response = await axios.get(`https://graph.instagram.com/v18.0/${INSTAGRAM_USER_ID}`, {
            params: {
                fields: 'followers_count,media_count,username',
                access_token: INSTAGRAM_ACCESS_TOKEN
            }
        });

        const followersCount = response.data.followers_count || 0;
        const mediaCount = response.data.media_count || 0;

        // 2. 최근 미디어 가져오기 (조회수 합산용)
        let totalViews = 0;
        try {
            const mediaResponse = await axios.get(`https://graph.instagram.com/v18.0/${INSTAGRAM_USER_ID}/media`, {
                params: {
                    fields: 'media_type,media_url,like_count,comments_count,timestamp',
                    limit: 100,
                    access_token: INSTAGRAM_ACCESS_TOKEN
                }
            });

            // 동영상/릴스의 조회수 합산 (개별로 다시 요청 필요)
            // Instagram은 전체 조회수를 직접 제공하지 않으므로 개별 미디어에서 가져와야 함
            // 하지만 API 할당량을 고려하여 일단 기본값 사용
            console.log('  Instagram 미디어 수:', mediaResponse.data.data.length);
            
        } catch (error) {
            console.log('  Instagram 미디어 조회수 집계 생략 (API 제한)');
        }

        const instagramData = {
            followersCount: followersCount,
            mediaCount: mediaCount,
            viewCount: totalViews, // Instagram은 전체 조회수를 직접 제공하지 않음
            lastUpdate: new Date().toISOString()
        };

        console.log('✅ Instagram 데이터 업데이트 완료');
        console.log(`  팔로워: ${formatNumber(followersCount)}, 게시물: ${formatNumber(mediaCount)}`);
        
        return instagramData;
    } catch (error) {
        console.error('❌ Instagram API 호출 오류:', error.response?.data || error.message);
        return {
            followersCount: 0,
            mediaCount: 0,
            viewCount: 0,
            lastUpdate: new Date().toISOString()
        };
    }
}

// ========================================
// TikTok API (준비)
// ========================================

async function fetchTikTokData() {
    try {
        console.log('🎵 TikTok API 데이터 가져오기 시도...');
        
        if (!TIKTOK_ACCESS_TOKEN) {
            console.log('⚠️  TikTok Access Token이 없습니다. 기본값 사용.');
            return {
                followersCount: 0,
                videoCount: 0,
                viewCount: 0,
                lastUpdate: new Date().toISOString()
            };
        }

        // TikTok API 호출 (Access Token이 있을 때)
        const response = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
            headers: {
                'Authorization': `Bearer ${TIKTOK_ACCESS_TOKEN}`
            }
        });

        const userData = response.data.data.user;
        const followersCount = userData.follower_count || 0;
        const videoCount = userData.video_count || 0;

        console.log('✅ TikTok 데이터 업데이트 완료');
        console.log(`  팔로워: ${formatNumber(followersCount)}, 영상: ${formatNumber(videoCount)}`);
        
        return {
            followersCount: followersCount,
            videoCount: videoCount,
            viewCount: 0, // TikTok도 전체 조회수는 개별 집계 필요
            lastUpdate: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ TikTok API 호출 오류:', error.response?.data || error.message);
        console.log('  기본값 사용 (Access Token 발급 후 자동 연동)');
        return {
            followersCount: 0,
            videoCount: 0,
            viewCount: 0,
            lastUpdate: new Date().toISOString()
        };
    }
}

// ========================================
// 통합 통계 시스템
// ========================================

async function fetchAllSocialMediaStats() {
    try {
        console.log('\n🔄 === 소셜 미디어 통합 통계 업데이트 시작 ===\n');
        
        // 모든 플랫폼 데이터 병렬로 가져오기
        const [youtubeData, instagramData, tiktokData] = await Promise.all([
            fetchYouTubeData(),
            fetchInstagramData(),
            fetchTikTokData()
        ]);

        // 통합 통계 계산
        const totalSubscribers = 
            (youtubeData?.channelInfo?.subscriberCountRaw || 0) + 
            (instagramData?.followersCount || 0) + 
            (tiktokData?.followersCount || 0);

        const totalVideos = 
            (youtubeData?.channelInfo?.videoCountRaw || 0) + 
            (instagramData?.mediaCount || 0) + 
            (tiktokData?.videoCount || 0);

        const totalViews = 
            (youtubeData?.channelInfo?.viewCountRaw || 0) + 
            (instagramData?.viewCount || 0) + 
            (tiktokData?.viewCount || 0);

        const socialStats = {
            total: {
                subscribers: formatNumber(totalSubscribers),
                subscribersRaw: totalSubscribers,
                videos: formatNumber(totalVideos),
                videosRaw: totalVideos,
                views: formatNumber(totalViews),
                viewsRaw: totalViews
            },
            platforms: {
                youtube: {
                    subscribers: youtubeData?.channelInfo?.subscriberCountRaw || 0,
                    videos: youtubeData?.channelInfo?.videoCountRaw || 0,
                    views: youtubeData?.channelInfo?.viewCountRaw || 0
                },
                instagram: {
                    followers: instagramData?.followersCount || 0,
                    posts: instagramData?.mediaCount || 0,
                    views: instagramData?.viewCount || 0
                },
                tiktok: {
                    followers: tiktokData?.followersCount || 0,
                    videos: tiktokData?.videoCount || 0,
                    views: tiktokData?.viewCount || 0
                }
            },
            lastUpdate: new Date().toISOString()
        };

        // 통합 통계 캐시 파일에 저장
        fs.writeFileSync(SOCIAL_STATS_CACHE_FILE, JSON.stringify(socialStats, null, 2), 'utf8');
        
        console.log('\n✅ === 통합 통계 업데이트 완료 ===');
        console.log(`📊 총 구독자/팔로워: ${socialStats.total.subscribers}`);
        console.log(`🎬 총 영상/게시물: ${socialStats.total.videos}`);
        console.log(`👁️  총 조회수: ${socialStats.total.views}`);
        console.log(`🕐 업데이트 시간: ${new Date().toLocaleString('ko-KR')}\n`);
        
        return socialStats;
    } catch (error) {
        console.error('❌ 통합 통계 업데이트 오류:', error.message);
        
        // 캐시 파일이 있으면 반환
        if (fs.existsSync(SOCIAL_STATS_CACHE_FILE)) {
            console.log('⚠️  캐시된 통합 통계를 사용합니다.');
            return JSON.parse(fs.readFileSync(SOCIAL_STATS_CACHE_FILE, 'utf8'));
        }
        
        return null;
    }
}

// ========================================
// 유틸리티 함수
// ========================================

// ISO 8601 duration을 분:초 형식으로 변환
function formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    let result = '';
    if (hours) result += `${hours}:`;
    result += `${minutes || '0'}:${seconds.padStart(2, '0')}`;
    
    return result;
}

// 숫자 포맷팅
function formatNumber(num) {
    const number = parseInt(num);
    if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
}

// 캐시된 데이터 읽기
function getCachedYouTubeData() {
    if (fs.existsSync(YOUTUBE_CACHE_FILE)) {
        return JSON.parse(fs.readFileSync(YOUTUBE_CACHE_FILE, 'utf8'));
    }
    return null;
}

function getCachedSocialStats() {
    if (fs.existsSync(SOCIAL_STATS_CACHE_FILE)) {
        return JSON.parse(fs.readFileSync(SOCIAL_STATS_CACHE_FILE, 'utf8'));
    }
    return null;
}

// ========================================
// 어드민 기능들
// ========================================

// 스케줄러 상태 관리
let schedulerActive = true;
let schedulerTasks = [];

// 카카오 토큰 관리 (다중 사용자 지원)
let kakaoUsers = []; // [{ userId, accessToken, refreshToken, nickname, loginTime }]

// 토큰 암호화/복호화 함수들
function encryptToken(token) {
    if (!token) return null;
    
    try {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(process.env.SUPABASE_ANON_KEY || 'default-key', 'salt', 32);
        const iv = crypto.randomBytes(16);
        
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        
        let encrypted = cipher.update(token, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // IV + EncryptedData를 결합
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('❌ 토큰 암호화 실패:', error.message);
        return null;
    }
}

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

// 사용자 토큰 관리 함수들 (DB 저장 포함)
async function addKakaoUser(userId, accessToken, refreshToken, nickname) {
    try {
        // DB에 저장
        const dbSuccess = await saveKakaoUserToDB(userId, accessToken, refreshToken, nickname);
        
        if (dbSuccess) {
            // 메모리에서도 업데이트
            kakaoUsers = kakaoUsers.filter(user => user.userId !== userId);
            kakaoUsers.push({
                userId: userId,
                accessToken: accessToken,
                refreshToken: refreshToken,
                nickname: nickname || 'Unknown',
                loginTime: new Date().toISOString()
            });
            
            console.log(`✅ 카카오 사용자 추가: ${nickname} (${userId})`);
            console.log(`📊 현재 등록된 사용자 수: ${kakaoUsers.length}명`);
            return true;
        } else {
            console.error(`❌ ${nickname} 사용자 추가 실패`);
            return false;
        }
    } catch (error) {
        console.error('❌ 사용자 추가 중 오류:', error);
        return false;
    }
}

async function removeKakaoUser(userId) {
    try {
        // DB에서 삭제
        const dbSuccess = await removeKakaoUserFromDB(userId);
        
        if (dbSuccess) {
            // 메모리에서도 제거
            const beforeCount = kakaoUsers.length;
            kakaoUsers = kakaoUsers.filter(user => user.userId !== userId);
            const afterCount = kakaoUsers.length;
            
            if (beforeCount > afterCount) {
                console.log(`❌ 카카오 사용자 제거: ${userId}`);
                console.log(`📊 현재 등록된 사용자 수: ${kakaoUsers.length}명`);
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('❌ 사용자 제거 중 오류:', error);
        return false;
    }
}

function getKakaoUsers() {
    return kakaoUsers.map(user => ({
        userId: user.userId,
        nickname: user.nickname,
        loginTime: user.loginTime
    }));
}

// Supabase DB 저장/로드 함수들
async function saveKakaoUserToDB(userId, accessToken, refreshToken, nickname) {
    try {
        const encryptedRefreshToken = encryptToken(refreshToken);
        
        const { error } = await supabase
            .from('kakao_users')
            .upsert({
                user_id: userId,
                nickname: nickname,
                access_token: accessToken,
                refresh_token_encrypted: encryptedRefreshToken,
                login_time: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        
        if (error) throw error;
        console.log(`✅ ${nickname}의 토큰을 DB에 저장 완료`);
        return true;
    } catch (error) {
        console.error('❌ DB 저장 실패:', error);
        return false;
    }
}

async function loadKakaoUsersFromDB() {
    try {
        const { data, error } = await supabase
            .from('kakao_users')
            .select('*')
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        kakaoUsers = data.map(user => ({
            userId: user.user_id,
            accessToken: user.access_token,
            refreshToken: decryptToken(user.refresh_token_encrypted),
            nickname: user.nickname,
            loginTime: user.login_time
        }));
        
        console.log(`📊 DB에서 ${kakaoUsers.length}명의 사용자 토큰 로드 완료`);
        return true;
    } catch (error) {
        console.error('❌ DB 로드 실패:', error);
        kakaoUsers = [];
        return false;
    }
}

async function updateUserTokenInDB(userId, accessToken, refreshToken) {
    try {
        const encryptedRefreshToken = encryptToken(refreshToken);
        
        const { error } = await supabase
            .from('kakao_users')
            .update({
                access_token: accessToken,
                refresh_token_encrypted: encryptedRefreshToken,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        
        if (error) throw error;
        console.log(`✅ ${userId}의 토큰을 DB에서 업데이트 완료`);
        return true;
    } catch (error) {
        console.error('❌ DB 토큰 업데이트 실패:', error);
        return false;
    }
}

async function removeKakaoUserFromDB(userId) {
    try {
        const { error } = await supabase
            .from('kakao_users')
            .delete()
            .eq('user_id', userId);
        
        if (error) throw error;
        console.log(`✅ ${userId}의 데이터를 DB에서 삭제 완료`);
        return true;
    } catch (error) {
        console.error('❌ DB 사용자 삭제 실패:', error);
        return false;
    }
}

// 사용자 토큰 갱신 함수
async function refreshUserToken(userId) {
    try {
        const user = kakaoUsers.find(u => u.userId === userId);
        if (!user || !user.refreshToken) {
            console.error(`❌ ${userId}의 리프레시 토큰이 없습니다.`);
            return false;
        }

        console.log(`🔄 ${user.nickname}의 토큰 갱신 시도...`);

        // 카카오 토큰 갱신 API 호출
        const response = await axios.post('https://kauth.kakao.com/oauth/token', 
            `grant_type=refresh_token&client_id=${process.env.KAKAO_REST_API_KEY}&refresh_token=${user.refreshToken}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        if (response.data.access_token) {
            // 새로운 토큰으로 DB 업데이트
            const updateSuccess = await updateUserTokenInDB(userId, response.data.access_token, response.data.refresh_token || user.refreshToken);
            
            if (updateSuccess) {
                // 메모리에서도 업데이트
                const userIndex = kakaoUsers.findIndex(u => u.userId === userId);
                if (userIndex !== -1) {
                    kakaoUsers[userIndex].accessToken = response.data.access_token;
                    if (response.data.refresh_token) {
                        kakaoUsers[userIndex].refreshToken = response.data.refresh_token;
                    }
                }
                
                console.log(`✅ ${user.nickname}의 토큰 갱신 완료`);
                return true;
            } else {
                console.error(`❌ ${user.nickname}의 토큰 DB 업데이트 실패`);
                return false;
            }
        } else {
            console.error(`❌ ${user.nickname}의 토큰 갱신 응답에 액세스 토큰이 없습니다.`);
            return false;
        }
    } catch (error) {
        console.error(`❌ ${userId}의 토큰 갱신 실패:`, error.response?.data || error.message);
        return false;
    }
}

// ========================================
// Supabase 설정 관리 함수들
// ========================================

// 설정값 저장 함수
async function saveSetting(key, value, description = null) {
    try {
        const { error } = await supabase
            .from('settings')
            .upsert({
                key: key,
                value: value,
                description: description,
                updated_at: new Date().toISOString()
            });
        
        if (error) throw error;
        console.log(`✅ 설정 저장 완료: ${key} = ${value}`);
        return true;
    } catch (error) {
        console.error('❌ 설정 저장 실패:', error);
        return false;
    }
}

// 설정값 로드 함수
async function loadSetting(key, defaultValue = null) {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', key)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
        
        const value = data?.value || defaultValue;
        console.log(`📋 설정 로드: ${key} = ${value}`);
        return value;
    } catch (error) {
        console.error(`❌ 설정 로드 실패 (${key}):`, error);
        return defaultValue;
    }
}

// 스케줄러 상태 저장
async function saveSchedulerStatus(active) {
    return await saveSetting('scheduler_active', active.toString(), '카카오톡 자동 알림 스케줄러 활성화 상태');
}

// 스케줄러 상태 로드
async function loadSchedulerStatus() {
    const value = await loadSetting('scheduler_active', 'true');
    return value === 'true';
}

// 서버 상태 체크
async function checkServerStatus() {
    try {
        const uptime = process.uptime();
        const memory = process.memoryUsage();
        
        // 더 정확한 메모리 사용률 계산 (RSS 기준)
        const memoryUsagePercent = (memory.rss / (1024 * 1024 * 1024)) * 100; // GB 단위로 변환 후 퍼센트
        const heapUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;
        
        // 서버 상태 판단 기준
        let status = 'normal';
        let issues = [];
        
        // 1. 메모리 사용률 체크 (RSS 기준으로 변경)
        // RSS가 500MB 이상이면 경고 (시스템 메모리 대비)
        if (memory.rss > 500 * 1024 * 1024) { // 500MB
            status = 'warning';
            issues.push(`High RSS memory usage: ${(memory.rss / 1024 / 1024).toFixed(1)}MB`);
        }
        
        // 힙 사용률은 95% 이상일 때만 경고 (더 관대한 기준)
        if (heapUsagePercent > 95) {
            if (status === 'normal') status = 'warning';
            issues.push(`High heap usage: ${heapUsagePercent.toFixed(1)}%`);
        }
        
        // 2. 업타임 체크 (1분 미만이면 최근 재시작)
        if (uptime < 60) {
            if (status === 'normal') status = 'warning';
            issues.push('Recent server restart');
        }
        
        // 3. 프로세스 상태 체크
        if (!process.pid) {
            status = 'error';
            issues.push('No process ID');
        }
        
        console.log(`🔍 서버 상태 체크: ${status} (RSS: ${(memory.rss / 1024 / 1024).toFixed(1)}MB, 힙: ${heapUsagePercent.toFixed(1)}%, 업타임: ${formatUptime(uptime)})`);
        if (issues.length > 0) {
            console.log(`⚠️ 서버 이슈: ${issues.join(', ')}`);
        }
        
        return {
            status: status,
            uptime: uptime,
            memory: memory,
            uptimeFormatted: formatUptime(uptime),
            memoryFormatted: formatMemory(memory),
            memoryUsagePercent: heapUsagePercent.toFixed(1),
            rssMemoryMB: (memory.rss / 1024 / 1024).toFixed(1),
            issues: issues
        };
    } catch (error) {
        console.error('❌ 서버 상태 체크 실패:', error);
        return {
            status: 'error',
            uptime: 0,
            memory: { heapUsed: 0, heapTotal: 0 },
            uptimeFormatted: '알 수 없음',
            memoryFormatted: '알 수 없음',
            memoryUsagePercent: '0',
            issues: ['서버 상태 체크 실패']
        };
    }
}

// 어드민 상태 조회
async function getAdminStatus() {
    try {
        // 서버 상태 체크
        const serverStatus = await checkServerStatus();

        // API 연결 상태 체크
        const apiStatus = await checkAPIStatus();

        // 마지막 동기화 시간
        const syncTimes = await getLastSyncTimes();

        // 방문자 통계 (14일)
        const visitorStatsResult = await getVisitorStats(14);

        // 스케줄러 상태
        const schedulerStatus = {
            active: schedulerActive,
            nextRun: getNextScheduledTime()
        };

        return {
            server: serverStatus,
            apis: apiStatus,
            syncTimes: syncTimes,
            visitorStats: visitorStatsResult.data,
            totalVisitors: visitorStatsResult.total,
            scheduler: schedulerStatus
        };
    } catch (error) {
        console.error('❌ 어드민 상태 조회 오류:', error);
        throw error;
    }
}

// API 연결 상태 체크
async function checkAPIStatus() {
    const status = {
        youtube: { status: 'error' },
        instagram: { status: 'error' },
        tiktok: { status: 'error' },
        supabase: { status: 'error' }
    };

    // YouTube API 체크 - 마지막 동기화 시간 기준
    try {
        const cachedStats = getCachedSocialStats();
        if (cachedStats && cachedStats.lastUpdate) {
            const lastUpdate = new Date(cachedStats.lastUpdate);
            const now = new Date();
            const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60); // 시간 차이 계산
            
            if (hoursDiff <= 12) {
                status.youtube.status = 'normal';
                console.log(`✅ YouTube API: 마지막 동기화 ${hoursDiff.toFixed(1)}시간 전 (정상)`);
            } else {
                status.youtube.status = 'error';
                console.log(`❌ YouTube API: 마지막 동기화 ${hoursDiff.toFixed(1)}시간 전 (비정상)`);
            }
        } else {
            console.log('❌ YouTube API: 동기화 데이터 없음');
        }
    } catch (error) {
        console.log('❌ YouTube API 체크 실패:', error.message);
    }

    // Instagram API 체크 - 마지막 동기화 시간 기준
    try {
        const cachedStats = getCachedSocialStats();
        if (cachedStats && cachedStats.lastUpdate) {
            const lastUpdate = new Date(cachedStats.lastUpdate);
            const now = new Date();
            const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60); // 시간 차이 계산
            
            if (hoursDiff <= 12) {
                status.instagram.status = 'normal';
                console.log(`✅ Instagram API: 마지막 동기화 ${hoursDiff.toFixed(1)}시간 전 (정상)`);
            } else {
                status.instagram.status = 'error';
                console.log(`❌ Instagram API: 마지막 동기화 ${hoursDiff.toFixed(1)}시간 전 (비정상)`);
            }
        } else {
            console.log('❌ Instagram API: 동기화 데이터 없음');
        }
    } catch (error) {
        console.log('❌ Instagram API 체크 실패:', error.message);
    }

    // TikTok API 체크
    try {
        if (TIKTOK_USERNAME && TIKTOK_ACCESS_TOKEN) {
            // TikTok API는 실제 API 엔드포인트가 제한적이므로 사용자명과 토큰 존재만 확인
            // 실제 API 호출은 복잡하므로 설정된 값들로 판단
            status.tiktok.status = 'normal';
            console.log('✅ TikTok API 설정 확인됨');
        } else {
            console.log('❌ TikTok API: 사용자명 또는 액세스 토큰이 설정되지 않음');
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

// 마지막 동기화 시간 조회
async function getLastSyncTimes() {
    const syncTimes = {
        youtube: '-',
        instagram: '-',
        tiktok: '-'
    };

    try {
        const cachedStats = getCachedSocialStats();
        if (cachedStats && cachedStats.lastUpdate) {
            const lastUpdate = new Date(cachedStats.lastUpdate);
            const timeString = lastUpdate.toLocaleString('ko-KR');
            
            // 모든 API가 같은 시간에 동기화되므로
            syncTimes.youtube = timeString;
            syncTimes.instagram = timeString;
            syncTimes.tiktok = timeString;
        }
    } catch (error) {
        console.log('동기화 시간 조회 실패:', error.message);
    }

    return syncTimes;
}

// 방문자 통계 조회 (지정된 일수, 10/18일부터만)
async function getVisitorStats(days = 14) {
    try {
        // 2025-10-18부터 시작 (10/15, 16, 17일 제외)
        const startDate = '2025-10-18';
        
        const { data, error } = await supabase
            .from('visitor_counter')
            .select('date, today')
            .gte('date', startDate) // 10/18일 이후 데이터만
            .order('date', { ascending: false })
            .limit(days);

        if (error) {
            console.error('❌ 방문자 통계 조회 오류:', error);
            return { data: [], total: 0 };
        }

        if (data && data.length > 0) {
            // 10/18일 이전 데이터 필터링 (혹시 모를 경우를 대비)
            const filteredData = data.filter(item => {
                const itemDate = new Date(item.date);
                const startDateObj = new Date(startDate);
                return itemDate >= startDateObj;
            });
            
            // 총 방문자 수 계산
            const total = filteredData.reduce((sum, item) => sum + (item.today || 0), 0);
            
            console.log(`✅ 방문자 통계 조회 성공: ${filteredData.length}일 데이터 (10/18부터만), 총 ${total}명`);
            console.log('📅 조회된 날짜들:', filteredData.map(item => item.date).join(', '));
            return { 
                data: filteredData.reverse(), // 10/18부터 역순으로 정렬
                total: total 
            };
        } else {
            console.log('⚠️ 방문자 통계 데이터가 없습니다.');
            console.log('🔍 10/18일 이후 데이터가 Supabase에 없을 수 있습니다.');
            return { data: [], total: 0 };
        }
    } catch (error) {
        console.error('❌ 방문자 통계 조회 실패:', error);
        return { data: [], total: 0 };
    }
}

// 카카오톡 메시지 발송
async function sendKakaoNotification(type = 'daily') {
    try {
        const adminStatus = await getAdminStatus();
        
        // 카카오톡 메시지 내용 생성
        const messageContent = generateKakaoMessageContent(adminStatus, type);
        
        // 카카오톡 메시지 API 호출
        const result = await sendKakaoMessage(messageContent);
        
        if (result.success) {
            console.log(`✅ ${type === 'test' ? '테스트' : '일일'} 카카오톡 알림 발송 완료`);
            return {
                success: true,
                message: `${type === 'test' ? '테스트' : '일일'} 카카오톡 알림이 성공적으로 발송되었습니다.`
            };
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('❌ 카카오톡 알림 발송 실패:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// 카카오톡 메시지 내용 생성
function generateKakaoMessageContent(adminStatus, type) {
    const now = new Date();
    const timeString = now.toLocaleString('ko-KR');
    
    if (type === 'test') {
        return `🧪 율무인데요 서버 테스트 알림

⏰ 발송시간: ${timeString}

📊 서버 상태: ${adminStatus.server.status === 'normal' ? '✅ 정상' : '❌ 비정상'}
⏱️ 업타임: ${adminStatus.server.uptimeFormatted}
💾 메모리: ${adminStatus.server.memoryFormatted}

🔌 API 상태:
• YouTube: ${adminStatus.apis.youtube.status === 'normal' ? '✅ 정상' : '❌ 비정상'}
• Instagram: ${adminStatus.apis.instagram.status === 'normal' ? '✅ 정상' : '❌ 비정상'}
• TikTok: ${adminStatus.apis.tiktok.status === 'normal' ? '✅ 정상' : '❌ 비정상'}
• Supabase: ${adminStatus.apis.supabase.status === 'normal' ? '✅ 정상' : '❌ 비정상'}

이것은 테스트 알림입니다.`;
    } else {
        const today = new Date();
        const todayString = today.toLocaleDateString('ko-KR');
        const todayVisitors = adminStatus.visitorStats.length > 0 
            ? adminStatus.visitorStats[adminStatus.visitorStats.length - 1].today 
            : 0;

        return `📅 율무인데요 일일 서버 리포트

📅 날짜: ${todayString}
⏰ 발송시간: ${timeString}

📊 서버 상태: ${adminStatus.server.status === 'normal' ? '✅ 정상' : '❌ 비정상'}
⏱️ 업타임: ${adminStatus.server.uptimeFormatted}
💾 메모리: ${adminStatus.server.memoryFormatted}

🔌 API 상태:
• YouTube: ${adminStatus.apis.youtube.status === 'normal' ? '✅ 정상' : '❌ 비정상'}
• Instagram: ${adminStatus.apis.instagram.status === 'normal' ? '✅ 정상' : '❌ 비정상'}
• TikTok: ${adminStatus.apis.tiktok.status === 'normal' ? '✅ 정상' : '❌ 비정상'}
• Supabase: ${adminStatus.apis.supabase.status === 'normal' ? '✅ 정상' : '❌ 비정상'}

⏰ 마지막 동기화:
• YouTube: ${adminStatus.syncTimes.youtube}
• Instagram: ${adminStatus.syncTimes.instagram}
• TikTok: ${adminStatus.syncTimes.tiktok}

👥 오늘 방문자: ${todayVisitors}명

매일 21시에 자동으로 발송되는 일일 리포트입니다.`;
    }
}

// 특정 사용자의 카카오 액세스 토큰 갱신
async function refreshUserToken(userId) {
    try {
        const user = kakaoUsers.find(u => u.userId === userId);
        if (!user) {
            throw new Error('사용자를 찾을 수 없습니다.');
        }
        
        if (!user.refreshToken) {
            throw new Error('리프레시 토큰이 없습니다.');
        }
        
        console.log(`🔄 ${user.nickname}의 카카오 액세스 토큰 갱신 시도...`);
        
        const response = await axios.post('https://kauth.kakao.com/oauth/token', 
            `grant_type=refresh_token&client_id=${process.env.KAKAO_REST_API_KEY}&refresh_token=${user.refreshToken}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        if (response.data.access_token) {
            // DB에서 토큰 업데이트
            const dbSuccess = await updateUserTokenInDB(userId, response.data.access_token, response.data.refresh_token);
            
            if (dbSuccess) {
                // 메모리에서도 업데이트
                user.accessToken = response.data.access_token;
                if (response.data.refresh_token) {
                    user.refreshToken = response.data.refresh_token;
                }
                console.log(`✅ ${user.nickname}의 카카오 액세스 토큰 갱신 완료`);
                return true;
            } else {
                console.error(`❌ ${user.nickname}의 토큰 갱신은 성공했지만 DB 업데이트 실패`);
                return false;
            }
        } else {
            throw new Error('토큰 갱신 응답에 액세스 토큰이 없습니다.');
        }
    } catch (error) {
        console.error(`❌ ${userId}의 카카오 액세스 토큰 갱신 실패:`, error.response?.data || error.message);
        return false;
    }
}

// 카카오톡 메시지 발송 (다중 사용자 지원)
async function sendKakaoMessage(messageContent) {
    try {
        // 등록된 사용자 확인
        if (kakaoUsers.length === 0) {
            throw new Error('등록된 카카오 사용자가 없습니다. 먼저 카카오 로그인을 해주세요.');
        }
        
        console.log(`📤 ${kakaoUsers.length}명의 사용자에게 메시지 전송 시작...`);
        
        const results = [];
        let successCount = 0;
        let failCount = 0;
        
        // 모든 사용자에게 순차적으로 메시지 전송
        for (const user of kakaoUsers) {
            try {
                console.log(`📱 ${user.nickname}에게 메시지 전송 중...`);
                
                const result = await sendMessageToUser(user, messageContent);
                results.push({
                    userId: user.userId,
                    nickname: user.nickname,
                    success: result.success,
                    message: result.message
                });
                
                if (result.success) {
                    successCount++;
                    console.log(`✅ ${user.nickname}에게 메시지 전송 성공`);
                } else {
                    failCount++;
                    console.log(`❌ ${user.nickname}에게 메시지 전송 실패: ${result.message}`);
                }
                
                // 사용자 간 전송 간격 (API 제한 방지)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                failCount++;
                console.error(`❌ ${user.nickname}에게 메시지 전송 중 오류:`, error.message);
                results.push({
                    userId: user.userId,
                    nickname: user.nickname,
                    success: false,
                    message: error.message
                });
            }
        }
        
        console.log(`📊 메시지 전송 완료: 성공 ${successCount}명, 실패 ${failCount}명`);
        
        return {
            success: successCount > 0,
            message: `${successCount}명에게 메시지 전송 완료 (실패: ${failCount}명)`,
            results: results
        };
        
    } catch (error) {
        console.error('❌ 카카오톡 메시지 발송 실패:', error.message);
        return {
            success: false,
            message: error.message
        };
    }
}

// 개별 사용자에게 메시지 전송
async function sendMessageToUser(user, messageContent) {
    try {
        // 환경에 따른 기본 URL 설정
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? 'https://your-domain.vercel.app' 
            : 'http://192.168.1.4:3000';
        
        // 카카오톡 나에게 메시지 API 호출 (개인 계정)
        let response = await axios.post('https://kapi.kakao.com/v2/api/talk/memo/default/send', 
            `template_object=${encodeURIComponent(JSON.stringify({
                object_type: 'text',
                text: messageContent,
                link: {
                    web_url: `${baseUrl}/admin.html`,
                    mobile_web_url: `${baseUrl}/admin.html`
                }
            }))}`, 
            {
                headers: {
                    'Authorization': `Bearer ${user.accessToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        // 401 오류 시 토큰 갱신 후 재시도
        if (response.status === 401 || (response.data && response.data.code === -401)) {
            console.log(`🔄 ${user.nickname}의 액세스 토큰 만료 감지, 토큰 갱신 시도...`);
            
            const refreshSuccess = await refreshUserToken(user.userId);
            if (refreshSuccess) {
                // 갱신된 토큰으로 재시도
                const updatedUser = kakaoUsers.find(u => u.userId === user.userId);
                response = await axios.post('https://kapi.kakao.com/v2/api/talk/memo/default/send', 
                    `template_object=${encodeURIComponent(JSON.stringify({
                        object_type: 'text',
                        text: messageContent,
                        link: {
                            web_url: `${baseUrl}/admin.html`,
                            mobile_web_url: `${baseUrl}/admin.html`
                        }
                    }))}`, 
                    {
                        headers: {
                            'Authorization': `Bearer ${updatedUser.accessToken}`,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                );
            } else {
                throw new Error('토큰 갱신에 실패했습니다. 다시 로그인해주세요.');
            }
        }
        
        if (response.data.result_code === 0) {
            return {
                success: true,
                message: '메시지 전송 성공'
            };
        } else {
            throw new Error(`카카오톡 API 오류: ${response.data.msg}`);
        }
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.msg || error.message
        };
    }
}

// 스케줄러 토글 (Supabase 저장 포함)
async function toggleScheduler() {
    schedulerActive = !schedulerActive;
    
    // Supabase에 상태 저장
    const saveSuccess = await saveSchedulerStatus(schedulerActive);
    
    if (schedulerActive) {
        console.log('✅ 스케줄러가 활성화되었습니다.');
    } else {
        console.log('⏸️ 스케줄러가 비활성화되었습니다.');
    }
    
    if (!saveSuccess) {
        console.error('⚠️ 스케줄러 상태 저장에 실패했습니다. 메모리에서만 변경되었습니다.');
    }
    
    return {
        success: true,
        message: `스케줄러가 ${schedulerActive ? '활성화' : '비활성화'}되었습니다.`,
        active: schedulerActive,
        saved: saveSuccess
    };
}

// 다음 스케줄 시간 계산
function getNextScheduledTime() {
    const now = new Date();
    const next21 = new Date(now);
    next21.setHours(21, 0, 0, 0);
    
    if (next21 <= now) {
        next21.setDate(next21.getDate() + 1);
    }
    
    return next21.toLocaleString('ko-KR');
}

// 유틸리티 함수들
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return 'Less than 1m';
    }
}

function formatMemory(memoryUsage) {
    const used = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const total = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    return `${used}MB / ${total}MB`;
}

// ========================================
// 서버 시작 시 캐시 확인
// ========================================

// 서버 재구동 시 자동으로 데이터를 받아오지 않음
// 기존 캐시 파일이 있으면 그것을 사용
if (fs.existsSync(YOUTUBE_CACHE_FILE) && fs.existsSync(SOCIAL_STATS_CACHE_FILE)) {
    console.log('✅ 캐시된 데이터를 사용합니다.');
    const cachedStats = getCachedSocialStats();
    if (cachedStats) {
        console.log(`📊 마지막 업데이트: ${new Date(cachedStats.lastUpdate).toLocaleString('ko-KR')}`);
        console.log(`   총 구독자/팔로워: ${cachedStats.total.subscribers}`);
        console.log(`   총 영상/게시물: ${cachedStats.total.videos}`);
    }
} else {
    console.log('⚠️  캐시된 데이터가 없습니다.');
    console.log('💡 데이터를 받아오려면 다음 중 하나를 실행하세요:');
    console.log('   1. 스케줄된 시간까지 대기 (08:00, 13:00, 20:00)');
    console.log('   2. 수동 업데이트: http://localhost:3000/api/update-all-stats');
}
console.log('');

// ========================================
// 스케줄러 설정
// ========================================

cron.schedule('0 8 * * *', () => {
    console.log('⏰ 08:00 - 예약된 소셜 미디어 데이터 업데이트 실행');
    fetchAllSocialMediaStats();
});

cron.schedule('0 13 * * *', () => {
    console.log('⏰ 13:00 - 예약된 소셜 미디어 데이터 업데이트 실행');
    fetchAllSocialMediaStats();
});

cron.schedule('0 20 * * *', () => {
    console.log('⏰ 20:00 - 예약된 소셜 미디어 데이터 업데이트 실행');
    fetchAllSocialMediaStats();
});

// 매일 21시에 일일 알림 발송
cron.schedule('0 21 * * *', () => {
    if (schedulerActive) {
        console.log('⏰ 21:00 - 일일 서버 상태 알림 발송');
        sendKakaoNotification('daily').then(result => {
            if (result.success) {
                console.log('✅ 일일 알림 발송 완료');
            } else {
                console.error('❌ 일일 알림 발송 실패:', result.message);
            }
        }).catch(error => {
            console.error('❌ 일일 알림 발송 오류:', error);
        });
    } else {
        console.log('⏸️ 스케줄러가 비활성화되어 일일 알림을 건너뜁니다.');
    }
});

console.log('📅 스케줄러 설정 완료: 매일 08:00, 13:00, 20:00에 자동 업데이트, 21:00에 일일 알림 발송\n');

// ========================================
// HTTP 서버
// ========================================

const server = http.createServer((req, res) => {
    // YouTube 데이터 API 엔드포인트
    if (req.url === '/api/youtube-data') {
        const cachedData = getCachedYouTubeData();
        if (cachedData) {
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(cachedData));
        } else {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '데이터를 불러오는 중입니다.' }));
        }
        return;
    }

    // 통합 소셜 미디어 통계 API 엔드포인트
    if (req.url === '/api/social-stats') {
        const cachedData = getCachedSocialStats();
        if (cachedData) {
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(cachedData));
        } else {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '데이터를 불러오는 중입니다.' }));
        }
        return;
    }

    // 수동 업데이트 엔드포인트 (테스트용)
    if (req.url === '/api/update-all-stats') {
        fetchAllSocialMediaStats().then(data => {
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ success: true, data }));
        }).catch(error => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        });
        return;
    }

    // 방문자 카운터 조회 API
    if (req.url === '/api/visitor-count') {
        getVisitorCounter().then(data => {
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(data));
        }).catch(error => {
            console.error('❌ 방문자 카운터 조회 API 오류:', error);
            res.writeHead(500, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: '방문자 카운터 조회 실패' }));
        });
        return;
    }

    // 방문자 카운터 증가 API
    if (req.url === '/api/visitor-increment' && req.method === 'POST') {
        incrementVisitor().then(data => {
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(data));
        }).catch(error => {
            console.error('❌ 방문자 카운터 증가 API 오류:', error);
            res.writeHead(500, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: '방문자 카운터 증가 실패' }));
        });
        return;
    }

    // ========================================
    // 어드민 API 엔드포인트들
    // ========================================

    // 어드민 상태 조회 API
    if (req.url === '/api/admin/status') {
        getAdminStatus().then(data => {
            res.writeHead(200, { 
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(data));
        }).catch(error => {
            console.error('❌ 어드민 상태 조회 API 오류:', error);
            res.writeHead(500, { 
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ error: '어드민 상태 조회 실패' }));
        });
        return;
    }

    // 카카오톡 알림 발송 API
    if (req.url === '/api/admin/send-notification' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { type } = JSON.parse(body);
                sendKakaoNotification(type).then(result => {
                    res.writeHead(200, { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify(result));
                }).catch(error => {
                    console.error('❌ 카카오톡 알림 발송 API 오류:', error);
                    res.writeHead(500, { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: false, message: error.message }));
                });
            } catch (error) {
                res.writeHead(400, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ success: false, message: '잘못된 요청 형식' }));
            }
        });
        return;
    }

    // 스케줄러 토글 API
    if (req.url === '/api/admin/toggle-scheduler' && req.method === 'POST') {
        toggleScheduler().then(result => {
            res.writeHead(200, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(result));
        }).catch(error => {
            console.error('❌ 스케줄러 토글 API 오류:', error);
            res.writeHead(500, { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ success: false, message: error.message }));
        });
        return;
    }

    // 카카오 액세스 토큰 저장 API (다중 사용자 지원)
    if (req.url === '/api/kakao/save-token' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { accessToken, refreshToken, userId, nickname } = JSON.parse(body);
                
                if (!accessToken) {
                    res.writeHead(400, { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: false, message: '액세스 토큰이 필요합니다.' }));
                    return;
                }
                
                // 사용자 추가 (중복 방지, DB 저장 포함)
                const addSuccess = await addKakaoUser(userId || 'unknown', accessToken, refreshToken, nickname);
                
                res.writeHead(200, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ 
                    success: addSuccess, 
                    message: addSuccess ? '카카오 토큰이 성공적으로 저장되었습니다.' : '토큰 저장에 실패했습니다.',
                    userCount: kakaoUsers.length
                }));
            } catch (error) {
                console.error('❌ 카카오 토큰 저장 API 오류:', error);
                res.writeHead(400, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ success: false, message: '잘못된 요청 형식' }));
            }
        });
        return;
    }

    // 카카오 토큰 발급 API (인증 코드로 토큰 요청)
    if (req.url === '/api/kakao/get-token' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { code } = JSON.parse(body);
                
                if (!code) {
                    res.writeHead(400, { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ success: false, message: '인증 코드가 필요합니다.' }));
                    return;
                }
                
                // 카카오 토큰 발급 요청
                const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', 
                    `grant_type=authorization_code&client_id=${process.env.KAKAO_REST_API_KEY}&redirect_uri=http://192.168.1.4:3000/kakao-callback.html&code=${code}`,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                );
                
                if (tokenResponse.data.access_token) {
                    // 사용자 정보 가져오기
                    const userInfoResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
                        headers: {
                            'Authorization': `Bearer ${tokenResponse.data.access_token}`
                        }
                    });
                    
                    const userId = userInfoResponse.data.id.toString();
                    const nickname = userInfoResponse.data.kakao_account?.profile?.nickname || 'Unknown';
                    
                    // 사용자 추가 (DB 저장 포함)
                    const addSuccess = await addKakaoUser(userId, tokenResponse.data.access_token, tokenResponse.data.refresh_token, nickname);
                    
                    res.writeHead(200, { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({ 
                        success: addSuccess, 
                        message: addSuccess ? '카카오 토큰이 성공적으로 발급되었습니다.' : '토큰 발급은 성공했지만 저장에 실패했습니다.',
                        userId: userId,
                        nickname: nickname,
                        userCount: kakaoUsers.length
                    }));
                } else {
                    throw new Error('토큰 발급 응답에 액세스 토큰이 없습니다.');
                }
            } catch (error) {
                console.error('❌ 카카오 토큰 발급 API 오류:', error.response?.data || error.message);
                res.writeHead(400, { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ 
                    success: false, 
                    message: error.response?.data?.error_description || error.message 
                }));
            }
        });
        return;
    }

    // 카카오 사용자 목록 조회 API
    if (req.url === '/api/kakao/users' && req.method === 'GET') {
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({ 
            success: true, 
            users: getKakaoUsers(),
            totalCount: kakaoUsers.length
        }));
        return;
    }

    // 정적 파일 제공
    let filePath = '.' + req.url;
    
    // 쿼리 파라미터 제거 (카카오 콜백 URL 처리)
    if (filePath.includes('?')) {
        filePath = filePath.split('?')[0];
    }
    
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(port, host, async () => {
    console.log(`🚀 서버 실행 중: http://${host}:${port}/`);
    console.log(`📺 YouTube: ${YOUTUBE_CHANNEL_ID}`);
    console.log(`📷 Instagram: ${process.env.INSTAGRAM_HANDLE}`);
    console.log(`🎵 TikTok: ${TIKTOK_USERNAME}`);
    console.log(`🗄️ Supabase: ${supabaseUrl}`);
    
    // 서버 시작 시 DB에서 스케줄러 상태 로드
    console.log('🔄 스케줄러 상태 로드 중...');
    schedulerActive = await loadSchedulerStatus();
    console.log(`⏰ 스케줄러: ${schedulerActive ? '활성화' : '비활성화'}`);
    
    // 서버 시작 시 DB에서 카카오 사용자 토큰 로드
    console.log('🔄 카카오 사용자 토큰 로드 중...');
    const loadSuccess = await loadKakaoUsersFromDB();
    if (loadSuccess) {
        console.log(`✅ 카카오 사용자 토큰 로드 완료: ${kakaoUsers.length}명`);
    } else {
        console.log('⚠️ 카카오 사용자 토큰 로드 실패 (새로 시작)');
    }
    
    console.log('Press Ctrl+C to stop the server\n');
});
