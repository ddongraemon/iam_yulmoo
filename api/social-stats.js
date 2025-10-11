const axios = require('axios');

// YouTube API
async function getChannelIdFromHandle(handle, apiKey) {
    const cleanHandle = handle.replace('@', '');
    const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
            part: 'snippet',
            q: cleanHandle,
            type: 'channel',
            maxResults: 1,
            key: apiKey
        }
    });
    
    if (searchResponse.data.items && searchResponse.data.items.length > 0) {
        return searchResponse.data.items[0].snippet.channelId;
    }
    
    throw new Error(`채널을 찾을 수 없습니다: ${handle}`);
}

async function fetchYouTubeStats(apiKey, channelHandle) {
    const channelId = await getChannelIdFromHandle(channelHandle, apiKey);
    
    const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
            part: 'statistics',
            id: channelId,
            key: apiKey
        }
    });

    const stats = channelResponse.data.items[0].statistics;
    return {
        subscribers: parseInt(stats.subscriberCount),
        videos: parseInt(stats.videoCount),
        views: parseInt(stats.viewCount)
    };
}

// Instagram API
async function fetchInstagramStats(userId, accessToken) {
    try {
        if (!userId || !accessToken) {
            return { followers: 0, posts: 0, views: 0 };
        }

        const response = await axios.get(`https://graph.instagram.com/v18.0/${userId}`, {
            params: {
                fields: 'followers_count,media_count',
                access_token: accessToken
            }
        });

        return {
            followers: response.data.followers_count || 0,
            posts: response.data.media_count || 0,
            views: 0
        };
    } catch (error) {
        console.error('Instagram API 오류:', error.message);
        return { followers: 0, posts: 0, views: 0 };
    }
}

// TikTok API
async function fetchTikTokStats(accessToken) {
    try {
        if (!accessToken) {
            return { followers: 0, videos: 0, views: 0 };
        }

        const response = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const userData = response.data.data.user;
        return {
            followers: userData.follower_count || 0,
            videos: userData.video_count || 0,
            views: 0
        };
    } catch (error) {
        console.error('TikTok API 오류:', error.message);
        return { followers: 0, videos: 0, views: 0 };
    }
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

// Vercel 서버리스 함수
module.exports = async (req, res) => {
    try {
        console.log('🔄 통합 소셜 미디어 통계 업데이트 시작');
        
        // 환경 변수
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
        const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID;
        const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
        const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;

        // 모든 플랫폼 데이터 병렬로 가져오기
        const [youtubeStats, instagramStats, tiktokStats] = await Promise.all([
            fetchYouTubeStats(YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID),
            fetchInstagramStats(INSTAGRAM_USER_ID, INSTAGRAM_ACCESS_TOKEN),
            fetchTikTokStats(TIKTOK_ACCESS_TOKEN)
        ]);

        // 통합 통계 계산
        const totalSubscribers = 
            (youtubeStats?.subscribers || 0) + 
            (instagramStats?.followers || 0) + 
            (tiktokStats?.followers || 0);

        const totalVideos = 
            (youtubeStats?.videos || 0) + 
            (instagramStats?.posts || 0) + 
            (tiktokStats?.videos || 0);

        const totalViews = 
            (youtubeStats?.views || 0) + 
            (instagramStats?.views || 0) + 
            (tiktokStats?.views || 0);

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
                youtube: youtubeStats,
                instagram: instagramStats,
                tiktok: tiktokStats
            },
            lastUpdate: new Date().toISOString()
        };

        console.log('✅ 통합 통계 업데이트 완료');
        console.log(`   총 구독자/팔로워: ${socialStats.total.subscribers}`);
        
        // 6시간 CDN 캐시 헤더 설정 (21600초)
        res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(socialStats);
        
    } catch (error) {
        console.error('❌ 통합 통계 오류:', error.message);
        res.status(500).json({ error: error.message });
    }
};

