require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cron = require('node-cron');

const port = process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';

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
    '.woff2': 'font/woff2'
};

// 캐시 파일 경로
const YOUTUBE_CACHE_FILE = path.join(__dirname, 'youtube-data.json');
const SOCIAL_STATS_CACHE_FILE = path.join(__dirname, 'social-stats.json');

// 채널 ID 캐시
let cachedChannelId = null;

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

console.log('📅 스케줄러 설정 완료: 매일 08:00, 13:00, 20:00에 자동 업데이트\n');

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

    // 정적 파일 제공
    let filePath = '.' + req.url;
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

server.listen(port, host, () => {
    console.log(`🚀 서버 실행 중: http://${host}:${port}/`);
    console.log(`📺 YouTube: ${YOUTUBE_CHANNEL_ID}`);
    console.log(`📷 Instagram: ${process.env.INSTAGRAM_HANDLE}`);
    console.log(`🎵 TikTok: ${TIKTOK_USERNAME}`);
    console.log('Press Ctrl+C to stop the server\n');
});
