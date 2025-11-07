const axios = require('axios');

// YouTube API 호출 함수
async function getChannelIdFromHandle(handle, apiKey) {
    try {
        // 이미 채널 ID 형식인 경우 (UC로 시작하는 경우) 바로 반환
        if (handle.startsWith('UC') && handle.length === 24) {
            console.log(`✅ 채널 ID 형식으로 인식: ${handle}`);
            return handle;
        }
        
        // 핸들 형식인 경우 검색
        const cleanHandle = handle.replace('@', '');
        
        // 채널 핸들로 직접 검색 (더 정확함)
        // 방법 1: forUsername 사용 (더 이상 권장되지 않지만 시도)
        try {
            const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
                params: {
                    part: 'id',
                    forUsername: cleanHandle,
                    key: apiKey
                }
            });
            
            if (channelResponse.data.items && channelResponse.data.items.length > 0) {
                const channelId = channelResponse.data.items[0].id;
                console.log(`✅ 채널 핸들로 찾기 성공: ${handle} -> ${channelId}`);
                return channelId;
            }
        } catch (e) {
            console.log('forUsername 검색 실패, search API 사용');
        }
        
        // 방법 2: search API 사용 (정확성 향상을 위해 검색어 개선)
        const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: `@${cleanHandle}`, // @ 기호를 포함하여 더 정확하게 검색
                type: 'channel',
                maxResults: 5, // 여러 결과를 확인하여 정확한 채널 찾기
                key: apiKey
            }
        });
        
        if (searchResponse.data.items && searchResponse.data.items.length > 0) {
            // 검색 결과에서 정확한 채널 찾기 (customUrl 또는 제목으로 확인)
            for (const item of searchResponse.data.items) {
                const snippet = item.snippet;
                const channelId = snippet.channelId;
                const customUrl = snippet.customUrl;
                const title = snippet.title;
                
                // customUrl이 정확히 일치하거나, 제목이 핸들과 유사한 경우
                if (customUrl && customUrl.toLowerCase().includes(cleanHandle.toLowerCase())) {
                    console.log(`✅ 정확한 채널 찾기 성공: ${handle} -> ${channelId} (${title})`);
                    return channelId;
                }
                
                // 제목이나 설명에서 핸들 확인
                if (title.toLowerCase().includes(cleanHandle.toLowerCase()) || 
                    snippet.description.toLowerCase().includes(cleanHandle.toLowerCase())) {
                    console.log(`✅ 채널 찾기 성공: ${handle} -> ${channelId} (${title})`);
                    return channelId;
                }
            }
            
            // 정확한 매칭이 없으면 첫 번째 결과 사용 (경고 로그 추가)
            const firstResult = searchResponse.data.items[0];
            console.warn(`⚠️ 정확한 채널 매칭 실패, 첫 번째 결과 사용: ${handle} -> ${firstResult.snippet.channelId} (${firstResult.snippet.title})`);
            return firstResult.snippet.channelId;
        }
        
        throw new Error(`채널을 찾을 수 없습니다: ${handle}`);
    } catch (error) {
        console.error('채널 ID 검색 오류:', error.response?.data || error.message);
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
        console.log(`📋 입력된 채널 ID/핸들: ${YOUTUBE_CHANNEL_ID}`);
        
        // 채널 ID 찾기
        const channelId = await getChannelIdFromHandle(YOUTUBE_CHANNEL_ID, YOUTUBE_API_KEY);
        console.log(`✅ 사용할 채널 ID: ${channelId}`);
        
        // 1. 채널 통계 정보 가져오기 (채널 ID로 직접 조회)
        const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
            params: {
                part: 'statistics,snippet',
                id: channelId,
                key: YOUTUBE_API_KEY
            }
        });
        
        // 채널 정보 검증
        if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
            throw new Error(`채널을 찾을 수 없습니다. 채널 ID: ${channelId}`);
        }
        
        const channelTitle = channelResponse.data.items[0].snippet.title;
        const channelCustomUrl = channelResponse.data.items[0].snippet.customUrl || '';
        console.log(`📺 채널명: ${channelTitle}`);
        console.log(`📺 채널 커스텀 URL: ${channelCustomUrl}`);

        // 채널 검증: 율무인데요 채널인지 확인
        const expectedChannelNames = ['율무인데요', 'Iam_Yulmoo', 'Iam Yulmoo'];
        const expectedCustomUrls = ['@Iam_Yulmoo', 'Iam_Yulmoo'];
        const isCorrectChannel = 
            expectedChannelNames.some(name => channelTitle.includes(name)) ||
            expectedCustomUrls.some(url => channelCustomUrl.includes(url)) ||
            channelId === 'UCILbGCfIkc-7lGUinQhBLyg'; // 정확한 채널 ID
        
        if (!isCorrectChannel) {
            console.error(`❌ 경고: 예상하지 못한 채널입니다!`);
            console.error(`   채널명: ${channelTitle}`);
            console.error(`   채널 ID: ${channelId}`);
            console.error(`   커스텀 URL: ${channelCustomUrl}`);
            // 검증 실패 시에도 계속 진행하되, 경고 로그만 출력
        } else {
            console.log(`✅ 채널 검증 성공: 율무인데요 채널 확인됨`);
        }

        const channelData = channelResponse.data.items[0];
        const subscriberCount = parseInt(channelData.statistics.subscriberCount);
        const videoCount = parseInt(channelData.statistics.videoCount);
        const viewCount = parseInt(channelData.statistics.viewCount);

        // 2. 인기 영상 3개 가져오기
        console.log(`🔍 인기 영상 조회 중... (채널 ID: ${channelId})`);
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
        
        if (!popularVideosResponse.data.items || popularVideosResponse.data.items.length === 0) {
            console.warn('⚠️ 인기 영상을 찾을 수 없습니다.');
        } else {
            console.log(`✅ 인기 영상 ${popularVideosResponse.data.items.length}개 찾음`);
            
            // 모든 영상이 같은 채널인지 검증
            const allFromSameChannel = popularVideosResponse.data.items.every(item => {
                const videoChannelId = item.snippet.channelId;
                const videoChannelTitle = item.snippet.channelTitle;
                const isMatch = videoChannelId === channelId;
                
                if (!isMatch) {
                    console.error(`❌ 경고: 다른 채널의 영상 발견!`);
                    console.error(`   영상: ${item.snippet.title}`);
                    console.error(`   영상 채널 ID: ${videoChannelId}`);
                    console.error(`   영상 채널명: ${videoChannelTitle}`);
                    console.error(`   예상 채널 ID: ${channelId}`);
                }
                
                return isMatch;
            });
            
            if (allFromSameChannel) {
                console.log(`✅ 모든 인기 영상이 올바른 채널에서 가져옴`);
            } else {
                console.error(`❌ 경고: 일부 영상이 다른 채널에서 가져온 것으로 보입니다!`);
            }
            
            popularVideosResponse.data.items.forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.snippet.title} (채널: ${item.snippet.channelTitle}, 채널 ID: ${item.snippet.channelId})`);
            });
        }

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



















