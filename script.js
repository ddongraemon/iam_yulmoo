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
let isManualScroll = false; // 수동 스크롤 플래그

function setupNavigation() {
    // Smooth scrolling for navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Update active link immediately
                elements.navLinks.forEach(l => {
                    l.classList.remove('active');
                });
                link.classList.add('active');
                
                // Set manual scroll flag
                isManualScroll = true;
                
                const offsetTop = targetElement.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Reset flag after scroll animation
                setTimeout(() => {
                    isManualScroll = false;
                }, 1000);
            }
        });
    });
    
    // Update active link on scroll (only when not manually scrolling)
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    // Skip if user manually clicked a link
    if (isManualScroll) return;
    
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
        navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // 700px 이하에서만 작동
            if (window.innerWidth <= 700) {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
                
                // 강제로 스타일 적용
                if (navMenu.classList.contains('active')) {
                    navMenu.style.setProperty('display', 'flex', 'important');
                    navMenu.style.position = 'fixed';
                    navMenu.style.top = '70px';
                    navMenu.style.right = '1rem';
                    // 화면 크기에 비례한 콤팩트한 크기 설정
                    const screenWidth = window.innerWidth;
                    const baseWidth = Math.max(screenWidth * 0.25, 120); // 화면 너비의 25%, 최소 120px
                    const baseHeight = Math.max(screenWidth * 0.25, 150); // 화면 너비의 25%, 최소 150px
                    const fontSize = Math.max(screenWidth * 0.025, 10); // 화면 너비의 2.5%, 최소 10px
                    const padding = Math.max(screenWidth * 0.015, 6); // 화면 너비의 1.5%, 최소 6px
                    const gap = Math.max(screenWidth * 0.01, 3); // 화면 너비의 1%, 최소 3px
                    
                    navMenu.style.setProperty('width', `${baseWidth}px`, 'important');
                    navMenu.style.setProperty('min-width', `${Math.min(baseWidth * 0.9, 110)}px`, 'important');
                    navMenu.style.setProperty('max-width', `${Math.min(baseWidth * 1.1, 140)}px`, 'important');
                    navMenu.style.setProperty('left', 'auto', 'important');
                    navMenu.style.setProperty('right', `${Math.max(screenWidth * 0.03, 8)}px`, 'important');
                    navMenu.style.height = 'auto';
                    navMenu.style.maxHeight = `${baseHeight}px`;
                    navMenu.style.backgroundColor = 'rgba(10, 10, 15, 0.95)';
                    navMenu.style.backdropFilter = 'blur(20px)';
                    navMenu.style.flexDirection = 'column';
                    navMenu.style.setProperty('padding', `${padding}px`, 'important');
                    navMenu.style.setProperty('gap', `${gap * 2}px`, 'important');
                    navMenu.style.borderRadius = '8px';
                    navMenu.style.border = 'none';
                    navMenu.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                    navMenu.style.zIndex = '9999999';
                    navMenu.style.overflow = 'visible';
                    navMenu.style.opacity = '0';
                    navMenu.style.transform = 'translateY(-10px) scale(0.95)';
                    navMenu.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    
                    // body에 직접 추가하여 모든 요소 위에 표시
                    document.body.appendChild(navMenu);
                    
                    // 깔끔한 메뉴 링크들 (이미지 스타일)
                    const menuLinks = navMenu.querySelectorAll('.nav-link');
                    menuLinks.forEach((link, index) => {
                        // 기본 스타일 설정
                        link.style.setProperty('font-size', `${fontSize}px`, 'important');
                        link.style.setProperty('padding', `${gap * 1.5}px 0`, 'important');
                        link.style.setProperty('margin', '0', 'important');
                        link.style.setProperty('border-radius', '0', 'important');
                        link.style.setProperty('background', 'transparent', 'important');
                        link.style.setProperty('border', 'none', 'important');
                        link.style.setProperty('backdrop-filter', 'none', 'important');
                        link.style.setProperty('transition', 'all 0.3s ease', 'important');
                        link.style.setProperty('color', '#ffffff', 'important');
                        link.style.setProperty('text-align', 'center', 'important');
                        link.style.setProperty('font-weight', '400', 'important');
                        link.style.setProperty('text-shadow', 'none', 'important');
                        link.style.setProperty('box-shadow', 'none', 'important');
                        link.style.setProperty('position', 'relative', 'important');
                        link.style.setProperty('display', 'block', 'important');
                        link.style.setProperty('text-decoration', 'none', 'important');
                        
                        // 핑크 밑줄 효과 (이미지와 동일)
                        const underline = document.createElement('div');
                        underline.style.position = 'absolute';
                        underline.style.bottom = '0';
                        underline.style.left = '50%';
                        underline.style.transform = 'translateX(-50%)';
                        underline.style.width = '0';
                        underline.style.height = '2px';
                        underline.style.backgroundColor = '#ff6b9d';
                        underline.style.transition = 'width 0.3s ease';
                        underline.style.borderRadius = '1px';
                        link.appendChild(underline);
                        
                        // 호버 효과
                        link.addEventListener('mouseenter', () => {
                            underline.style.width = '100%';
                            link.style.setProperty('color', '#ffffff', 'important');
                        });
                        
                        link.addEventListener('mouseleave', () => {
                            underline.style.width = '0';
                            link.style.setProperty('color', '#ffffff', 'important');
                        });
                        
                        // 메뉴 클릭 시 무조건 메뉴 닫기 (안전한 방법)
            link.addEventListener('click', () => {
                            // 즉시 메뉴 닫기
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                            
                            // 스타일 즉시 초기화
                            navMenu.style.display = 'none';
                            navMenu.style.opacity = '0';
                            navMenu.style.transform = 'translateY(-10px) scale(0.95)';
                            
                            // 밑줄 요소 제거
                            const underline = link.querySelector('div');
                            if (underline) {
                                underline.remove();
                            }
                            
                            // 원래 위치로 되돌리기
                            const navContainer = document.querySelector('.nav-container');
                            if (navContainer) {
                                navContainer.appendChild(navMenu);
                            }
            });
        });
                    
                    // 애니메이션 효과 적용
                    setTimeout(() => {
                        navMenu.style.opacity = '1';
                        navMenu.style.transform = 'translateY(0) scale(1)';
                    }, 10);
                } else {
                    // 닫기 애니메이션
                    navMenu.style.opacity = '0';
                    navMenu.style.transform = 'translateY(-10px) scale(0.95)';
                    
                    // 애니메이션 완료 후 스타일 초기화
                    setTimeout(() => {
                        // 메뉴 링크 스타일 및 이벤트 초기화
                        const menuLinks = navMenu.querySelectorAll('.nav-link');
                        menuLinks.forEach(link => {
                            // 밑줄 요소 제거
                            const underline = link.querySelector('div');
                            if (underline) {
                                underline.remove();
                            }
                            
                            link.style.removeProperty('font-size');
                            link.style.removeProperty('padding');
                            link.style.removeProperty('margin');
                            link.style.removeProperty('border-radius');
                            link.style.removeProperty('background');
                            link.style.removeProperty('border');
                            link.style.removeProperty('backdrop-filter');
                            link.style.removeProperty('transition');
                            link.style.removeProperty('color');
                            link.style.removeProperty('text-align');
                            link.style.removeProperty('font-weight');
                            link.style.removeProperty('text-shadow');
                            link.style.removeProperty('box-shadow');
                            link.style.removeProperty('position');
                            link.style.removeProperty('transform');
                            
                            // 이벤트 리스너 제거를 위해 클론
                            const newLink = link.cloneNode(true);
                            link.parentNode.replaceChild(newLink, link);
                        });
                        
                        navMenu.style.removeProperty('display');
                        navMenu.style.position = '';
                        navMenu.style.top = '';
                        navMenu.style.right = '';
                        navMenu.style.width = '';
                        navMenu.style.minWidth = '';
                        navMenu.style.maxWidth = '';
                        navMenu.style.height = '';
                        navMenu.style.maxHeight = '';
                        navMenu.style.backgroundColor = '';
                        navMenu.style.backdropFilter = '';
                        navMenu.style.flexDirection = '';
                        navMenu.style.padding = '';
                        navMenu.style.gap = '';
                        navMenu.style.borderRadius = '';
                        navMenu.style.borderTop = '';
                        navMenu.style.boxShadow = '';
                        navMenu.style.zIndex = '';
                        navMenu.style.overflow = '';
                        navMenu.style.opacity = '';
                        navMenu.style.transform = '';
                        navMenu.style.transition = '';
                        
                        // 원래 위치로 되돌리기
                        const navContainer = document.querySelector('.nav-container');
                        if (navContainer) {
                            navContainer.appendChild(navMenu);
                        }
                    }, 300);
                }
            }
        });
        
        // 메뉴 링크 클릭 이벤트는 각 링크에 직접 추가됨 (위에서 처리)
        
        // 화면 크기 변경 시 메뉴 초기화
        window.addEventListener('resize', () => {
            if (window.innerWidth > 700) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                // 스타일 초기화
                navMenu.style.display = '';
                navMenu.style.position = '';
                navMenu.style.top = '';
                navMenu.style.left = '';
                navMenu.style.right = '';
                navMenu.style.width = '';
                navMenu.style.height = '';
                navMenu.style.maxHeight = '';
                navMenu.style.backgroundColor = '';
                navMenu.style.backdropFilter = '';
                navMenu.style.flexDirection = '';
                navMenu.style.padding = '';
                navMenu.style.gap = '';
                navMenu.style.borderTop = '';
                navMenu.style.boxShadow = '';
                navMenu.style.zIndex = '';
                
                // 원래 위치로 되돌리기
                const navContainer = document.querySelector('.nav-container');
                if (navContainer) {
                    navContainer.appendChild(navMenu);
                }
            }
        });
    } else {
        console.error('❌ navToggle 또는 navMenu를 찾을 수 없습니다!');
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
        
        let youtubeData = null;
        
        // YouTube 영상 데이터 로드 (API 우선, 실패 시 정적 파일)
        try {
        const youtubeResponse = await fetch('/api/youtube-data');
        if (youtubeResponse.ok) {
                youtubeData = await youtubeResponse.json();
                console.log('✅ YouTube API 데이터 로드 완료');
            } else {
                throw new Error('API 응답 실패');
            }
        } catch (apiError) {
            console.warn('⚠️ API 호출 실패, 캐시된 데이터 사용:', apiError.message);
            // API 실패 시 정적 JSON 파일 사용
            const fallbackResponse = await fetch('/youtube-data.json');
            if (fallbackResponse.ok) {
                youtubeData = await fallbackResponse.json();
                console.log('✅ 캐시된 YouTube 데이터 로드 완료');
            }
        }
        
        if (youtubeData) {
            // 영상 섹션 렌더링
            renderPopularVideos(youtubeData.popularVideos);
            renderRecentVideos(youtubeData.recentVideos);
            
            // 비디오 카드 재설정
            setupVideoCards();
        }
        
        // 통합 소셜 미디어 통계 로드
        console.log('📊 통합 통계 데이터 로딩 중...');
        let statsData = null;
        
        try {
            const statsResponse = await fetch('/api/social-stats');
            if (statsResponse.ok) {
                statsData = await statsResponse.json();
                console.log('✅ 통합 통계 API 데이터 로드 완료:', statsData);
                
                // 데이터 유효성 검사: YouTube 데이터가 포함되어 있는지 확인
                if (!statsData.total || statsData.total.subscribersRaw < 4000) {
                    console.warn('⚠️ API 데이터가 불완전함 (YouTube 데이터 누락), 정적 파일 사용');
                    throw new Error('불완전한 API 데이터');
                }
            } else {
                throw new Error(`API 응답 실패: ${statsResponse.status}`);
            }
        } catch (apiError) {
            console.warn('⚠️ 통계 API 호출 실패, 캐시된 데이터 사용:', apiError.message);
            // API 실패 시 정적 JSON 파일 사용
            try {
                const fallbackResponse = await fetch('/social-stats.json');
                console.log('📄 정적 파일 요청:', fallbackResponse.status, fallbackResponse.ok);
                if (fallbackResponse.ok) {
                    statsData = await fallbackResponse.json();
                    console.log('✅ 캐시된 통계 데이터 로드 완료:', statsData);
                } else {
                    console.error('❌ 정적 파일 로드 실패:', fallbackResponse.status);
                }
            } catch (fallbackError) {
                console.error('❌ 정적 파일 fetch 오류:', fallbackError);
            }
        }
        
        if (statsData && statsData.total) {
            console.log('🎯 통계 업데이트 시작:', statsData.total);
            // 히어로 섹션 통계 업데이트
            updateHeroStats(statsData.total);
        } else {
            console.error('❌ 통계 데이터가 없습니다:', statsData);
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
    if (window.innerWidth <= 1198) {
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
    
    // 모바일과 태블릿에서 슬라이드 인디케이터 추가 (인기영상과 동일)
    if (window.innerWidth <= 1198) {
        setTimeout(() => {
            addSlideIndicators(videoSection, videoGrid, videos.length);
            // 드래그 및 터치 스크롤 기능 추가 (인기영상과 동일한 민감도)
            enableDragScroll(videoGrid);
        }, 100);
    }
    
    console.log('최신 영상 렌더링 완료 (인기영상과 동일한 설정):', videos.length, '개');
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
        
        // 인디케이터 클릭 시 해당 슬라이드로 이동
        dot.addEventListener('click', () => {
            const containerWidth = videoGrid.offsetWidth;
            videoGrid.scrollTo({
                left: i * containerWidth,
                behavior: 'smooth'
            });
        });
        
        indicatorsContainer.appendChild(dot);
    }
    
    // 비디오 그리드 다음에 추가
    videoGrid.parentElement.appendChild(indicatorsContainer);
    
    console.log('인디케이터 추가 완료');
    
    // 무한 스크롤을 위한 현재 인덱스 추적
    let currentIndex = 0;
    
    // 스크롤 이벤트로 활성 인디케이터 업데이트
    const updateIndicator = () => {
        const scrollPosition = videoGrid.scrollLeft;
        const containerWidth = videoGrid.offsetWidth;
        
        // 현재 인덱스 계산
        currentIndex = Math.round(scrollPosition / containerWidth);
        
        // 경계값 처리
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex >= videoCount) currentIndex = videoCount - 1;
        
        // 인디케이터 업데이트
        indicatorsContainer.querySelectorAll('.indicator-dot').forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    };
    
    // 스크롤 이벤트 - 인디케이터만 업데이트 (스냅은 CSS에 맡김)
    videoGrid.addEventListener('scroll', updateIndicator, { passive: true });
}

// 드래그 스크롤 기능 (마우스 및 초민감 터치)
function enableDragScroll(container) {
    // 이미 이벤트 리스너가 등록되어 있는지 확인
    if (container.dataset.dragScrollEnabled === 'true') {
        return;
    }
    container.dataset.dragScrollEnabled = 'true';
    
    let isDown = false;
    let startX;
    let scrollLeft;
    let scrollTimeout;
    
    // 마우스 드래그 처리
    const handleMouseDown = (e) => {
        isDown = true;
        container.style.cursor = 'grabbing';
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    };
    
    const handleMouseLeave = () => {
        isDown = false;
        container.style.cursor = 'grab';
    };
    
    const handleMouseUp = () => {
        isDown = false;
        container.style.cursor = 'grab';
    };
    
    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
    };
    
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);
    
    // 초민감 터치 이벤트 - 극도로 민감한 스와이프
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartScrollLeft = 0;
    let isHorizontalSwipe = null;
    const MIN_SWIPE_DISTANCE = 15;
    
    const handleTouchStart = (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartScrollLeft = container.scrollLeft;
        isHorizontalSwipe = null;
    };
    
    const handleTouchMove = (e) => {
        clearTimeout(scrollTimeout);
        
        if (isHorizontalSwipe === null) {
            const touchCurrentX = e.touches[0].clientX;
            const touchCurrentY = e.touches[0].clientY;
            const diffX = Math.abs(touchCurrentX - touchStartX);
            const diffY = Math.abs(touchCurrentY - touchStartY);
            
            if (diffX > diffY && diffX > 3) {
                isHorizontalSwipe = true;
            } else if (diffY > diffX && diffY > 3) {
                isHorizontalSwipe = false;
            }
        }
    };
    
    const handleTouchEnd = (e) => {
        if (isHorizontalSwipe === false) {
            isHorizontalSwipe = null;
            return;
        }
        
        const currentScrollLeft = container.scrollLeft;
        const scrollDiff = currentScrollLeft - touchStartScrollLeft;
        const containerWidth = container.offsetWidth;
        
        // 현재 인덱스를 정확히 계산
        const currentIndex = Math.floor(touchStartScrollLeft / containerWidth);
        
        // 15px 이상 움직였으면 무조건 다음/이전 영상으로
        if (Math.abs(scrollDiff) >= MIN_SWIPE_DISTANCE) {
            let targetIndex;
            
            if (scrollDiff > 0) {
                // 오른쪽 스와이프: 항상 다음 영상으로
                targetIndex = currentIndex + 1;
            } else {
                // 왼쪽 스와이프: 항상 이전 영상으로
                targetIndex = currentIndex - 1;
            }
            
            const maxIndex = Math.floor(container.scrollWidth / containerWidth) - 1;
            targetIndex = Math.max(0, Math.min(targetIndex, maxIndex));
            
            // 타겟 위치로 즉시 이동
            const targetScrollLeft = targetIndex * containerWidth;
            container.scrollTo({
                left: targetScrollLeft,
                behavior: 'smooth'
            });
        } else {
            // 15px 미만이면 현재 위치 유지 (원래 카드로 돌아가기)
            container.scrollTo({
                left: currentIndex * containerWidth,
                behavior: 'smooth'
            });
        }
        
        isHorizontalSwipe = null;
    };
    
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // 기본 커서 스타일
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

