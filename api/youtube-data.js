const axios = require('axios');

// YouTube API 호출 함수
async function getChannelIdFromHandle(handle, apiKey) {
    try {
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
    } catch (error) {
        console.error('채널 ID 검색 오류:', error.message);
        throw error;
    }
}

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

// Vercel 서버리스 함수
module.exports = async (req, res) => {
    try {
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

        if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
            throw new Error('YouTube API 설정이 없습니다.');
        }

        console.log('📺 YouTube API 데이터 가져오기 시작...');
        
        // 채널 ID 찾기
        const channelId = await getChannelIdFromHandle(YOUTUBE_CHANNEL_ID, YOUTUBE_API_KEY);
        
        // 1. 채널 통계 정보 가져오기
        const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
                part: 'statistics,snippet',
                id: channelId,
                key: YOUTUBE_API_KEY
            }
        });

        const channelData = channelResponse.data.items[0];
        const subscriberCount = parseInt(channelData.statistics.subscriberCount);
        const videoCount = parseInt(channelData.statistics.videoCount);
        const viewCount = parseInt(channelData.statistics.viewCount);

        // 2. 인기 영상 3개 가져오기
        const popularVideosResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                channelId: channelId,
                order: 'viewCount',
                type: 'video',
                maxResults: 3,
                key: YOUTUBE_API_KEY
            }
        });

        // 3. 최신 영상 3개 가져오기
        const recentVideosResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                channelId: channelId,
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

        console.log('✅ YouTube 데이터 업데이트 완료');
        
        // 6시간 CDN 캐시 헤더 설정
        res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(youtubeData);
        
    } catch (error) {
        console.error('❌ YouTube API 오류:', error.message);
        res.status(500).json({ error: error.message });
    }
};









