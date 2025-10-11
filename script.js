// Modern JavaScript for Yulmoo Channel Website

// Configuration
const CONFIG = {
    email: 'iamyulmoo@naver.com',
    youtubeUrl: 'https://www.youtube.com/@Iam_Yulmoo',
    tiktokUrl: 'https://www.tiktok.com/@iam_yulmoo'
};

// DOM Elements
const elements = {
    navbar: document.querySelector('.navbar'),
    navLinks: document.querySelectorAll('.nav-link'),
    navToggle: document.querySelector('.nav-toggle'),
    navMenu: document.querySelector('.nav-menu'),
    backToTop: document.getElementById('backToTop'),
    videoCards: document.querySelectorAll('.video-card'),
    contactBtn: document.querySelector('.contact-btn'),
    socialLinks: document.querySelectorAll('.social-link')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupScrollEffects();
    setupVideoCards();
    setupContactButton();
    setupSocialLinks();
    setupAnimations();
    setupMobileMenu();
    loadYouTubeData(); // YouTube 데이터 로드
}

// Navigation functionality
function setupNavigation() {
    // Smooth scrolling for navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Update active link
                elements.navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
    
    // Update active link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            elements.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Scroll effects
function setupScrollEffects() {
    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            elements.navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        } else {
            elements.navbar.style.background = 'rgba(10, 10, 15, 0.8)';
        }
    });
    
    // Back to top button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            elements.backToTop.classList.add('visible');
        } else {
            elements.backToTop.classList.remove('visible');
        }
    });
    
    elements.backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Video card interactions
function setupVideoCards() {
    const videoCards = document.querySelectorAll('.video-card');
    
    videoCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Video grid horizontal scroll
    const videoGrid = document.querySelector('.video-grid');
    if (videoGrid && window.innerWidth <= 768) {
        let isDown = false;
        let startX;
        let scrollLeft;
        
        videoGrid.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - videoGrid.offsetLeft;
            scrollLeft = videoGrid.scrollLeft;
        });
        
        videoGrid.addEventListener('mouseleave', () => {
            isDown = false;
        });
        
        videoGrid.addEventListener('mouseup', () => {
            isDown = false;
        });
        
        videoGrid.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - videoGrid.offsetLeft;
            const walk = (x - startX) * 2;
            videoGrid.scrollLeft = scrollLeft - walk;
        });
    }
}

// Contact button
function setupContactButton() {
    const contactBtn = document.querySelector('.contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            window.location.href = `mailto:${CONFIG.email}`;
        });
    }
}

// Social links
function setupSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            createRippleEffect(e, this);
        });
    });
}

// Animations
function setupAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Mobile menu toggle
function setupMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        elements.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Ripple effect for buttons
function createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple effect styles
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
        z-index: 1;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .nav-menu.active {
        display: flex;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(10, 10, 15, 0.95);
        backdrop-filter: blur(20px);
        flex-direction: column;
        padding: 1rem;
        border-top: 1px solid var(--border);
    }
    
    .nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            display: none;
        }
    }
`;
document.head.appendChild(style);

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll events
const optimizedScrollHandler = debounce(() => {
    updateActiveNavLink();
}, 10);

window.addEventListener('scroll', optimizedScrollHandler);

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('An error occurred:', e.error);
});

// Service Worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

// Visitor Counter System - 날짜별 카운팅
class VisitorCounter {
    constructor() {
        this.totalKey = 'yulmoo_total_visitors';
        this.todayKey = 'yulmoo_today_visitors';
        this.dateKey = 'yulmoo_last_visit_date';
        this.sessionKey = 'yulmoo_session_counted';

        this.init();
    }

    init() {
        this.checkAndResetDaily();
        this.incrementVisitors();
        this.updateDisplay();
    }

    // 오늘 날짜 가져오기 (YYYY-MM-DD 형식)
    getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 날짜가 바뀌었는지 확인하고 TODAY 카운터 리셋
    checkAndResetDaily() {
        const today = this.getTodayDate();
        const lastVisitDate = localStorage.getItem(this.dateKey);

        if (lastVisitDate !== today) {
            // 날짜가 바뀌었으면 TODAY 카운터를 0으로 리셋
            localStorage.setItem(this.todayKey, '0');
            localStorage.setItem(this.dateKey, today);
            console.log(`날짜 변경: ${lastVisitDate || '없음'} → ${today}, TODAY 카운터 리셋`);
        }
    }

    getTotalVisitors() {
        const total = localStorage.getItem(this.totalKey);
        return total ? parseInt(total) : 0;
    }

    getTodayVisitors() {
        const today = localStorage.getItem(this.todayKey);
        return today ? parseInt(today) : 0;
    }

    saveTotalVisitors(count) {
        localStorage.setItem(this.totalKey, count.toString());
    }

    saveTodayVisitors(count) {
        localStorage.setItem(this.todayKey, count.toString());
    }

    incrementVisitors() {
        // 이 세션에서 이미 카운팅되었는지 확인
        if (sessionStorage.getItem(this.sessionKey)) {
            console.log('이미 카운팅된 세션입니다.');
            return;
        }

        // TOTAL 방문자 수 증가
        const currentTotal = this.getTotalVisitors();
        const newTotal = currentTotal + 1;
        this.saveTotalVisitors(newTotal);

        // TODAY 방문자 수 증가
        const currentToday = this.getTodayVisitors();
        const newToday = currentToday + 1;
        this.saveTodayVisitors(newToday);

        // 이 세션에서 카운팅되었음을 표시
        sessionStorage.setItem(this.sessionKey, 'true');

        console.log(`방문자 카운터: TOTAL ${newTotal}명, TODAY ${newToday}명`);
    }

    updateDisplay() {
        const totalElement = document.getElementById('totalVisitors');
        const todayElement = document.getElementById('todayVisitors');

        const total = this.getTotalVisitors();
        const today = this.getTodayVisitors();

        if (totalElement) {
            totalElement.textContent = this.formatNumber(total);
        }

        if (todayElement) {
            todayElement.textContent = this.formatNumber(today);
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// Initialize visitor counter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VisitorCounter();
});

// ========================================
// YouTube API 데이터 연동
// ========================================

// YouTube 데이터 로드 및 표시
async function loadYouTubeData() {
    try {
        console.log('📺 YouTube 데이터 로딩 중...');
        
        // YouTube 영상 데이터 로드
        const youtubeResponse = await fetch('/api/youtube-data');
        if (youtubeResponse.ok) {
            const youtubeData = await youtubeResponse.json();
            console.log('✅ YouTube 데이터 로드 완료');
            
            // 영상 섹션 렌더링
            renderPopularVideos(youtubeData.popularVideos);
            renderRecentVideos(youtubeData.recentVideos);
            
            // 비디오 카드 재설정
            setupVideoCards();
        }
        
        // 통합 소셜 미디어 통계 로드
        console.log('📊 통합 통계 데이터 로딩 중...');
        const statsResponse = await fetch('/api/social-stats');
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('✅ 통합 통계 로드 완료:', statsData);
            
            // 히어로 섹션 통계 업데이트
            updateHeroStats(statsData.total);
        }
        
    } catch (error) {
        console.error('❌ 데이터 로드 오류:', error);
        // 오류 발생 시 기본 플레이스홀더 유지
    }
}

// 히어로 섹션 통합 통계 업데이트
function updateHeroStats(totalStats) {
    if (!totalStats) return;
    
    // 구독자/팔로워 수
    const subscriberElement = document.querySelector('.hero-stats .stat-item:nth-child(1) .stat-number');
    if (subscriberElement) {
        subscriberElement.textContent = totalStats.subscribers;
        console.log('✅ 총 구독자/팔로워:', totalStats.subscribers);
    }
    
    // 영상/게시물 수
    const videoElement = document.querySelector('.hero-stats .stat-item:nth-child(2) .stat-number');
    if (videoElement) {
        videoElement.textContent = totalStats.videos;
        console.log('✅ 총 영상/게시물:', totalStats.videos);
    }
    
    // 조회수
    const viewElement = document.querySelector('.hero-stats .stat-item:nth-child(3) .stat-number');
    if (viewElement) {
        viewElement.textContent = totalStats.views;
        console.log('✅ 총 조회수:', totalStats.views);
    }
}

// 인기 영상 렌더링
function renderPopularVideos(videos) {
    if (!videos || videos.length === 0) return;
    
    const videoSection = document.querySelector('.video-section:not(.recent-videos)');
    const videoGrid = videoSection.querySelector('.video-grid');
    
    if (!videoGrid) return;
    
    videoGrid.innerHTML = ''; // 기존 내용 삭제
    
    videos.forEach((video, index) => {
        const videoCard = createVideoCard(video, index + 1);
        videoGrid.appendChild(videoCard);
    });
    
    // 모바일과 태블릿에서 슬라이드 인디케이터 추가
    if (window.innerWidth <= 1024) {
        setTimeout(() => {
            addSlideIndicators(videoSection, videoGrid, videos.length);
            // 드래그 기능 추가
            enableDragScroll(videoGrid);
        }, 100);
    }
    
    console.log('인기 영상 렌더링 완료:', videos.length, '개');
}

// 최신 영상 렌더링
function renderRecentVideos(videos) {
    if (!videos || videos.length === 0) return;
    
    const videoSection = document.querySelector('.video-section.recent-videos');
    const videoGrid = videoSection.querySelector('.video-grid');
    
    if (!videoGrid) return;
    
    videoGrid.innerHTML = ''; // 기존 내용 삭제
    
    videos.forEach((video, index) => {
        const videoCard = createVideoCard(video, index + 1);
        videoGrid.appendChild(videoCard);
    });
    
    // 모바일과 태블릿에서 슬라이드 인디케이터 추가
    if (window.innerWidth <= 1024) {
        setTimeout(() => {
            addSlideIndicators(videoSection, videoGrid, videos.length);
            // 드래그 기능 추가
            enableDragScroll(videoGrid);
        }, 100);
    }
    
    console.log('최신 영상 렌더링 완료:', videos.length, '개');
}

// 슬라이드 인디케이터 추가 (모바일/태블릿용)
function addSlideIndicators(videoSection, videoGrid, videoCount) {
    console.log('인디케이터 추가 중...', videoCount, '개');
    
    // 기존 인디케이터 제거
    const existingIndicators = videoSection.querySelector('.slide-indicators');
    if (existingIndicators) {
        existingIndicators.remove();
    }
    
    // 인디케이터 컨테이너 생성
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'slide-indicators';
    indicatorsContainer.style.display = 'flex';
    indicatorsContainer.style.visibility = 'visible';
    indicatorsContainer.style.opacity = '1';
    
    // 각 영상에 대한 점 생성
    for (let i = 0; i < videoCount; i++) {
        const dot = document.createElement('span');
        dot.className = 'indicator-dot';
        if (i === 0) dot.classList.add('active');
        indicatorsContainer.appendChild(dot);
    }
    
    // 비디오 그리드 다음에 추가
    videoGrid.parentElement.appendChild(indicatorsContainer);
    
    console.log('인디케이터 추가 완료');
    
    // 무한 스크롤을 위한 현재 인덱스 추적
    let currentIndex = 0;
    
    // 스크롤 이벤트로 활성 인디케이터 업데이트
    videoGrid.addEventListener('scroll', () => {
        const scrollPosition = videoGrid.scrollLeft;
        const containerWidth = videoGrid.offsetWidth;
        
        // 현재 인덱스 계산 (앞 더미 없음)
        currentIndex = Math.round(scrollPosition / containerWidth);
        
        // 경계값 처리
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex >= videoCount) currentIndex = videoCount - 1;
        
        // 디버깅: 인덱스가 올바르게 계산되는지 확인
        console.log('인덱스 계산:', {
            scrollPosition,
            containerWidth,
            계산된인덱스: Math.round(scrollPosition / containerWidth),
            최종인덱스: currentIndex,
            비디오개수: videoCount
        });
        
        // 인디케이터 업데이트
        indicatorsContainer.querySelectorAll('.indicator-dot').forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        console.log('=== 스크롤 정보 ===');
        console.log('스크롤 위치:', scrollPosition);
        console.log('컨테이너 너비:', containerWidth);
        console.log('계산된 인덱스:', Math.round(scrollPosition / containerWidth));
        console.log('최종 인덱스:', currentIndex);
        console.log('==================');
    });
    
}

// 드래그 스크롤 기능
function enableDragScroll(container) {
    let isDown = false;
    let startX;
    let scrollLeft;
    
    // 마우스 드래그
    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.style.cursor = 'grabbing';
        container.style.scrollBehavior = 'auto';
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });
    
    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.style.cursor = 'grab';
    });
    
    container.addEventListener('mouseup', () => {
        isDown = false;
        container.style.cursor = 'grab';
        container.style.scrollBehavior = 'smooth';
    });
    
    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
    });
    
    // 터치 드래그는 네이티브로 동작 (scroll-snap과 함께)
    container.style.cursor = 'grab';
}

// 비디오 카드 HTML 생성
function createVideoCard(video, index) {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    // 클릭 시 YouTube 영상으로 이동
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
        window.open(video.url, '_blank', 'noopener,noreferrer');
    });
    
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.thumbnail}" alt="${video.title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">
            <div class="video-overlay">
                <div class="video-duration">${video.duration}</div>
                <div class="video-views">${video.viewCount} 조회</div>
            </div>
            <div class="video-play-overlay">
                <i class="fas fa-play"></i>
            </div>
        </div>
        <div class="video-info">
            <h3 class="video-title">${video.title}</h3>
            <div class="video-stats">
                <div class="video-stat-row">
                    <div class="video-stat-item">
                        <i class="fas fa-heart"></i>
                        <span>${video.likeCount}</span>
                    </div>
                    <div class="video-stat-item">
                        <i class="fas fa-comment"></i>
                        <span>${video.commentCount}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// 비디오 카드 플레이 오버레이 스타일 추가
const videoStyle = document.createElement('style');
videoStyle.textContent = `
    .video-play-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60px;
        height: 60px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    }
    
    .video-card:hover .video-play-overlay {
        opacity: 1;
    }
    
    .video-play-overlay i {
        color: #ff0055;
        font-size: 24px;
        margin-left: 4px;
    }
    
    .video-thumbnail {
        position: relative;
        overflow: hidden;
    }
    
    .video-thumbnail img {
        transition: transform 0.3s ease;
    }
    
    .video-card:hover .video-thumbnail img {
        transform: scale(1.05);
    }
    
    .video-title {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.4;
        min-height: 2.8em;
    }
`;
document.head.appendChild(videoStyle);

