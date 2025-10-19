// Supabase 설정
const SUPABASE_URL = 'https://xthcitqhmsjslxayhgvt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_S3zm1hnfz6r30ntj4aUrkA_neuo-I7B';

// Supabase 클라이언트 초기화
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 운세 메시지 배열
const FORTUNE_MESSAGES = [
    "오늘은 괜히 기분이 좋을 운세야! 이유는 몰라도 그냥 좋을 거야, 그런 날 있잖아?",
    "조금 느리게 가도 괜찮아. 오늘은 '천천히가 제일 빠른 날'이래.",
    "누가 뭐래도 오늘은 네가 주인공이야! 조명은 이미 켜져 있대!",
    "작은 실수쯤은 괜찮아! 율무도 가끔 벽에 부딪혀~ 멍!",
    "오늘은 웃으면 행운이 와! 억지로라도 웃으면, 운세가 덤으로 따라올걸?",
    "마음이 복잡할 땐, 잠깐 숨 고르기. 생각보다 그 사이에 행운이 끼어들 거야.",
    "좋은 일은 생각보다 가까이 있어! 냉장고 열면 있을지도 몰라.",
    "오늘은 느긋하게, 율무처럼 낮잠 한 번 자면 모든 게 풀리는 날이야.",
    "누군가 네 마음을 따뜻하게 해줄 거야. 혹시 내가 먼저일 수도?",
    "오늘 하루, 괜히 잘 될 예감이 들어. 그거 진짜야, 믿어도 돼."
];

// DOM 요소
let fortuneCard;
let fortuneImage;
let loadingPlaceholder;
let tapHint;
let fortuneLoading;
let fortuneMessageContainer;
let fortuneText;
let retryBtn;
let backToTop;

// 상태 변수
let hasClicked = false;
let currentBucket = 'gallery-images'; // 최초: gallery-images, 클릭 후: fortune-images

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    initElements();
    loadInitialImage();
    setupEventListeners();
    setupBackToTop();
});

// DOM 요소 초기화
function initElements() {
    fortuneCard = document.getElementById('fortuneCard');
    fortuneImage = document.getElementById('fortuneImage');
    loadingPlaceholder = document.getElementById('loadingPlaceholder');
    tapHint = document.getElementById('tapHint');
    fortuneLoading = document.getElementById('fortuneLoading');
    fortuneMessageContainer = document.getElementById('fortuneMessageContainer');
    fortuneText = document.getElementById('fortuneText');
    retryBtn = document.getElementById('retryBtn');
    backToTop = document.getElementById('backToTop');
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 카드 클릭 이벤트
    if (fortuneCard) {
        fortuneCard.addEventListener('click', handleCardClick);
    }
    
    // 다시 때리기 버튼
    if (retryBtn) {
        retryBtn.addEventListener('click', handleRetry);
    }
}

// 최초 이미지 로드 (fortune-images 버킷의 first 폴더에서)
async function loadInitialImage() {
    try {
        console.log('최초 이미지 로딩 시작... (first 폴더에서)');
        
        // fortune-images 버킷의 'first' 폴더에서 파일 목록 가져오기
        const { data: files, error: listError } = await supabaseClient.storage
            .from('fortune-images')
            .list('first', {
                limit: 100,
                sortBy: { column: 'name', order: 'asc' }
            });
        
        if (listError) {
            console.warn('fortune-images/first 폴더가 없습니다. gallery에서 이미지를 가져옵니다.');
            // first 폴더가 없으면 gallery에서 가져오기
            const { data, error } = await supabaseClient
                .from('gallery')
                .select('*');
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                const randomImage = data[Math.floor(Math.random() * data.length)];
                const optimizedUrl = getOptimizedImageUrl(randomImage.image_url);
                fortuneImage.src = optimizedUrl;
                fortuneImage.style.display = 'block';
                loadingPlaceholder.style.display = 'none';
                console.log('최초 이미지 로드 성공 (gallery):', randomImage.file_name);
            } else {
                throw new Error('이미지를 찾을 수 없습니다.');
            }
            return;
        }
        
        if (files && files.length > 0) {
            // 랜덤 파일 선택
            const randomFile = files[Math.floor(Math.random() * files.length)];
            
            // 공개 URL 생성 (first 폴더 경로 포함)
            const { data: urlData } = supabaseClient.storage
                .from('fortune-images')
                .getPublicUrl(`first/${randomFile.name}`);
            
            // 이미지 표시 (모바일 최적화)
            const optimizedUrl = getOptimizedImageUrl(urlData.publicUrl);
            fortuneImage.src = optimizedUrl;
            fortuneImage.style.display = 'block';
            loadingPlaceholder.style.display = 'none';
            
            console.log('최초 이미지 로드 성공:', `first/${randomFile.name}`);
        } else {
            throw new Error('first 폴더에 이미지가 없습니다.');
        }
        
    } catch (error) {
        console.error('이미지 로드 오류:', error);
        loadingPlaceholder.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>이미지를 불러올 수 없습니다.</p>
        `;
    }
}

// 카드 클릭 핸들러
async function handleCardClick() {
    if (hasClicked) return; // 이미 클릭했으면 무시
    
    hasClicked = true;
    
    // 탭 힌트 숨기기
    if (tapHint) {
        tapHint.style.display = 'none';
    }
    
    // 기존 이미지 페이드아웃
    fortuneImage.style.animation = 'fadeOut 0.5s ease-in-out forwards';
    
    // 로딩 메시지 표시
    setTimeout(() => {
        fortuneLoading.style.display = 'block';
    }, 300);
    
    // 새로운 이미지 로드
    setTimeout(async () => {
        await loadFortuneImage();
        showFortuneMessage();
    }, 1500);
}

// 운세 이미지 로드 (fortune-images 버킷의 two 폴더에서)
async function loadFortuneImage() {
    try {
        console.log('운세 이미지 로딩 시작... (two 폴더에서)');
        
        // fortune-images 버킷의 'two' 폴더에서 파일 목록 가져오기
        const { data: files, error: listError } = await supabaseClient.storage
            .from('fortune-images')
            .list('two', {
                limit: 100,
                sortBy: { column: 'name', order: 'asc' }
            });
        
        if (listError) {
            console.warn('fortune-images/two 폴더가 없습니다. gallery-images를 사용합니다.');
            // two 폴더가 없으면 gallery에서 다시 가져오기
            const { data, error } = await supabaseClient
                .from('gallery')
                .select('*');
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                const randomImage = data[Math.floor(Math.random() * data.length)];
                updateFortuneImage(randomImage.image_url);
            }
            return;
        }
        
        if (files && files.length > 0) {
            // 랜덤 파일 선택
            const randomFile = files[Math.floor(Math.random() * files.length)];
            
            // 공개 URL 생성 (two 폴더 경로 포함)
            const { data: urlData } = supabaseClient.storage
                .from('fortune-images')
                .getPublicUrl(`two/${randomFile.name}`);
            
            const optimizedUrl = getOptimizedImageUrl(urlData.publicUrl);
            updateFortuneImage(optimizedUrl);
            console.log('운세 이미지 로드 성공:', `two/${randomFile.name}`);
        } else {
            throw new Error('운세 이미지를 찾을 수 없습니다.');
        }
        
    } catch (error) {
        console.error('운세 이미지 로드 오류:', error);
        // 오류 발생 시 gallery에서 이미지 가져오기
        const { data, error: galleryError } = await supabaseClient
            .from('gallery')
            .select('*');
        
        if (!galleryError && data && data.length > 0) {
            const randomImage = data[Math.floor(Math.random() * data.length)];
            const optimizedUrl = getOptimizedImageUrl(randomImage.image_url);
            updateFortuneImage(optimizedUrl);
        }
    }
}

// 이미지 최적화 URL 생성 (모바일용)
function getOptimizedImageUrl(src) {
    try {
        const isMobile = window.innerWidth <= 768;
        
        // 데스크톱에서는 원본 이미지 사용
        if (!isMobile) {
            return src;
        }
        
        // 모바일에서는 최적화된 이미지 사용
        const url = new URL(src);
        
        // Supabase Storage 이미지 변환 파라미터
        // - width: 800px (모바일에 적합한 크기)
        // - quality: 80 (고품질 유지)
        // - format: webp (최신 압축 형식)
        url.searchParams.set('width', '800');
        url.searchParams.set('quality', '80');
        url.searchParams.set('format', 'webp');
        
        console.log('모바일 이미지 최적화 적용:', url.toString());
        return url.toString();
        
    } catch (error) {
        console.warn('이미지 최적화 실패, 원본 사용:', error);
        return src;
    }
}

// 이미지 업데이트
function updateFortuneImage(imageUrl) {
    // 이미 최적화된 URL이므로 직접 사용
    fortuneImage.src = imageUrl;
    fortuneImage.style.animation = 'fadeIn 0.8s ease-in-out forwards';
    fortuneImage.style.display = 'block';
    
    // 로딩 메시지 숨기기
    setTimeout(() => {
        fortuneLoading.style.display = 'none';
    }, 800);
}

// 운세 메시지 표시
function showFortuneMessage() {
    // 랜덤 운세 메시지 선택
    const randomFortune = FORTUNE_MESSAGES[Math.floor(Math.random() * FORTUNE_MESSAGES.length)];
    
    // 메시지 표시
    fortuneText.textContent = randomFortune;
    fortuneMessageContainer.style.display = 'block';
    
    // 부드럽게 스크롤
    setTimeout(() => {
        fortuneMessageContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 300);
}

// 다시 때리기
function handleRetry() {
    // 상태 초기화
    hasClicked = false;
    
    // UI 초기화
    fortuneMessageContainer.style.display = 'none';
    fortuneLoading.style.display = 'none';
    tapHint.style.display = 'flex';
    
    // 새로운 최초 이미지 로드
    loadInitialImage();
    
    // 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Back to top 버튼
function setupBackToTop() {
    if (!backToTop) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.style.display = 'flex';
        } else {
            backToTop.style.display = 'none';
        }
    });
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// fadeOut 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.95);
        }
    }
`;
document.head.appendChild(style);

