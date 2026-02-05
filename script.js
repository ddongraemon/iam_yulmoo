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
    setupHeroVideo(); // 히어로 동영상 배경 설정
    loadYouTubeData(); // YouTube 데이터 로드
    loadGalleryPreview(); // 갤러리 프리뷰 로드
    setupFortuneButton(); // 율무 운세 버튼 설정
    setupActionButtons(); // 액션 버튼 설정
    setupGA4Tracking(); // GA4 이벤트 추적 설정
}

// Navigation functionality
let isManualScroll = false; // 수동 스크롤 플래그

function setupNavigation() {
    // Smooth scrolling for navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            
            // 외부 링크 (admin.html 등)는 기본 동작 허용
            if (targetId && (targetId.includes('.html') || targetId.startsWith('http'))) {
                return; // 기본 링크 동작 허용
            }
            
            e.preventDefault();
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
    // Navbar background on scroll (고정된 밝은 톤 유지)
    window.addEventListener('scroll', () => {
        elements.navbar.style.background = 'rgba(214, 207, 192, 0.9)'; // D6CFC0 계열
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
            this.classList.add('touch-active');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('touch-active');
            this.style.transform = '';
            this.style.boxShadow = '';
            this.style.borderColor = '#5a4633'; // 갈색 계열로 설정
        });
        
        // 터치 시작 시 자연스러운 그림자
        card.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, { passive: true });
        
        // 터치 종료/취소 시 원복
        const reset = function(el) {
            el.classList.remove('touch-active');
            el.style.transform = '';
            el.style.boxShadow = '';
            el.style.borderColor = '#5a4633'; // 갈색 계열로 설정
        };
        card.addEventListener('touchend', function() { reset(this); }, { passive: true });
        card.addEventListener('touchcancel', function() { reset(this); }, { passive: true });
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
                    navMenu.style.backgroundColor = 'rgba(214, 207, 192, 0.98)'; // D6CFC0 계열
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
                        link.style.setProperty('color', '#000000', 'important');
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
                            link.style.setProperty('color', '#000000', 'important');
                        });
                        
                        link.addEventListener('mouseleave', () => {
                            underline.style.width = '0';
                            link.style.setProperty('color', '#000000', 'important');
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

// 히어로 동영상 배경 설정
function setupHeroVideo() {
    const heroVideo = document.querySelector('.hero-video');
    
    if (!heroVideo) {
        console.log('히어로 동영상이 없습니다.');
        return;
    }
    
    // 모바일 디바이스 확인
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    // 모바일에서 비디오 설정 강제
    if (isMobile) {
        heroVideo.setAttribute('playsinline', 'true');
        heroVideo.setAttribute('webkit-playsinline', 'true');
        heroVideo.setAttribute('x5-playsinline', 'true');
        heroVideo.muted = true;
        heroVideo.loop = true;
    }
    
    // 동영상 자동 재생 보장 함수
    const playVideo = () => {
        if (heroVideo.paused) {
            const playPromise = heroVideo.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('✅ 히어로 비디오 재생 성공');
                    })
                    .catch(error => {
                        console.log('⚠️ 비디오 자동 재생 실패 (모바일 정책):', error.message);
                        // 모바일에서는 사용자 상호작용 후 재생 시도
                        setupUserInteractionPlay();
                    });
            }
        }
    };
    
    // 사용자 상호작용 시 재생 시도
    const setupUserInteractionPlay = () => {
        const playOnInteraction = () => {
            heroVideo.play().catch(err => {
                console.log('재생 실패:', err);
            });
        };
        
        // 다양한 이벤트에서 재생 시도
        ['click', 'touchstart', 'scroll'].forEach(eventType => {
            document.addEventListener(eventType, playOnInteraction, { once: true, passive: true });
        });
    };
    
    // 동영상 로드 완료 시 재생
    heroVideo.addEventListener('loadeddata', () => {
        console.log('📹 비디오 로드 완료');
        playVideo();
    });
    
    // 동영상 메타데이터 로드 시 재생 (모바일 최적화)
    heroVideo.addEventListener('loadedmetadata', () => {
        console.log('📹 비디오 메타데이터 로드 완료');
        playVideo();
    });
    
    // canplay 이벤트에서도 재생 시도
    heroVideo.addEventListener('canplay', () => {
        playVideo();
    });
    
    // 동영상 종료 시 자동 반복 (loop 속성이 있지만 보장용)
    heroVideo.addEventListener('ended', () => {
        heroVideo.currentTime = 0;
        heroVideo.play().catch(err => console.log('반복 재생 실패:', err));
    });
    
    // 페이지 visible 상태 복원 시 재생
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && heroVideo.paused) {
            playVideo();
        }
    });
    
    // Intersection Observer로 뷰포트에 들어올 때 재생
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && heroVideo.paused) {
                playVideo();
            }
        });
    }, observerOptions);
    
    observer.observe(heroVideo);
    
    // 모바일에서 초기 재생 시도 (약간의 지연 후)
    if (isMobile) {
        setTimeout(() => {
            playVideo();
        }, 300);
    } else {
        // 즉시 재생 시도
        playVideo();
    }
    
    // 페이지 로드 완료 후에도 재생 시도
    if (document.readyState === 'complete') {
        playVideo();
    } else {
        window.addEventListener('load', () => {
            setTimeout(playVideo, 100);
        });
    }
    
    console.log('✅ 히어로 동영상 배경 설정 완료', { isMobile });
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

// Visitor Counter System - 서버 기반 통합 카운팅
class VisitorCounter {
    constructor() {
        this.sessionKey = 'yulmoo_session_counted';
        this.init();
    }

    async init() {
        // 이 세션에서 이미 카운팅되었는지 확인
        const isSessionCounted = sessionStorage.getItem(this.sessionKey);
        
        if (!isSessionCounted) {
            // 서버에 방문자 증가 요청
            await this.incrementVisitor();
            // 이 세션에서 카운팅되었음을 표시
            sessionStorage.setItem(this.sessionKey, 'true');
        } else {
            // 이미 카운팅된 세션이면 현재 값만 가져오기
            await this.loadVisitorCount();
        }
        
        // 화면에 표시
        await this.updateDisplay();
    }

    async incrementVisitor() {
        try {
            const response = await fetch('/api/visitor-increment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ 방문자 카운터: TOTAL ${data.total}명, TODAY ${data.today}명`);
                return data;
            }
        } catch (error) {
            console.error('❌ 방문자 카운터 증가 오류:', error);
        }
        return null;
    }

    async loadVisitorCount() {
        try {
            const response = await fetch('/api/visitor-count');
            if (response.ok) {
                const data = await response.json();
                console.log(`📊 방문자 카운터 조회: TOTAL ${data.total}명, TODAY ${data.today}명`);
                return data;
            }
        } catch (error) {
            console.error('❌ 방문자 카운터 조회 오류:', error);
        }
        return null;
    }

    async updateDisplay() {
        const data = await this.loadVisitorCount();
        
        if (!data) return;

        const totalElement = document.getElementById('totalVisitors');
        const todayElement = document.getElementById('todayVisitors');

        if (totalElement) {
            totalElement.textContent = this.formatNumber(data.total);
        }

        if (todayElement) {
            todayElement.textContent = this.formatNumber(data.today);
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
            // 인기 영상 섹션 렌더링 (최신 영상 섹션은 제거됨)
            renderPopularVideos(youtubeData.popularVideos);
            
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
    if (!videoSection) {
        console.warn('⚠️ 인기 영상 섹션을 찾을 수 없습니다');
        return;
    }
    
    const videoGrid = videoSection.querySelector('.video-grid');
    if (!videoGrid) {
        console.warn('⚠️ 비디오 그리드를 찾을 수 없습니다');
        return;
    }
    
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
    if (!videoSection) {
        console.warn('⚠️ 최신 영상 섹션을 찾을 수 없습니다');
        return;
    }
    
    const videoGrid = videoSection.querySelector('.video-grid');
    if (!videoGrid) {
        console.warn('⚠️ 최신 영상 그리드를 찾을 수 없습니다');
        return;
    }
    
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

// 터치 효과를 위한 이벤트 리스너 추가
function setupTouchEffects() {
    // 영상 카드 터치 효과
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        // 터치 시작
        card.addEventListener('touchstart', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 16px 64px rgba(0, 0, 0, 0.4)';
            this.style.borderColor = '#ff6b9d';
        }, { passive: true });
        
        // 터치 종료
        card.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
                this.style.boxShadow = '';
                this.style.borderColor = '';
            }, 150);
        }, { passive: true });
        
        // 터치 취소
        card.addEventListener('touchcancel', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
            this.style.borderColor = '';
        }, { passive: true });
    });
    
    // 갤러리 카드 터치 효과
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        // 터치 시작
        item.addEventListener('touchstart', function() {
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = '0 16px 64px rgba(0, 0, 0, 0.4)';
            this.style.borderColor = '#ff6b9d';
        }, { passive: true });
        
        // 터치 종료
        item.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
                this.style.boxShadow = '';
                this.style.borderColor = '';
            }, 150);
        }, { passive: true });
        
        // 터치 취소
        item.addEventListener('touchcancel', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
            this.style.borderColor = '';
        }, { passive: true });
    });
}

// 페이지 로드 시 터치 효과 설정
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    document.addEventListener('DOMContentLoaded', setupTouchEffects);
    // 동적으로 추가되는 요소를 위해 약간 지연 후 다시 실행
    setTimeout(setupTouchEffects, 500);
}

// 갤러리 프리뷰 로드 (로컬 images/gallery 폴더 사용)
async function loadGalleryPreview() {
    try {
        const isMobile = window.innerWidth <= 768;
        const isLowEndDevice = navigator.hardwareConcurrency <= 4;
        const networkSpeed = detectNetworkSpeed();
        
        console.log(`📱 갤러리 프리뷰 로딩 시작 - 모바일: ${isMobile}, 저사양: ${isLowEndDevice}, 네트워크: ${networkSpeed}`);
        
        // 로컬 API에서 갤러리 이미지 목록 가져오기
        const res = await fetch('/api/gallery?year=all');
        const data = await res.json();
        const allImages = data.images || [];
        
        if (!allImages.length) {
            console.log('갤러리에 이미지가 없습니다. images/gallery/2023, 2024, 2025 폴더에 이미지를 넣어주세요.');
            return;
        }
        
        // 랜덤하게 3개 선택 (Fisher-Yates shuffle 알고리즘)
        const shuffled = [...allImages].sort(() => Math.random() - 0.5);
        const selectedImages = shuffled.slice(0, 3);
        
        // 갤러리 아이템 업데이트 (지연 로딩 적용)
        const galleryItems = document.querySelectorAll('.gallery-section .gallery-item');
        
        selectedImages.forEach((image, index) => {
            if (galleryItems[index]) {
                const placeholder = galleryItems[index].querySelector('.gallery-placeholder');
                
                if (placeholder) {
                    // 최적화된 URL 생성
                    const optimizedUrl = getOptimizedGalleryPreviewUrl(image.image_url, isMobile);
                    
                    // 첫 번째 이미지는 즉시 로딩, 나머지는 지연 로딩
                    const shouldLazyLoad = index > 0;
                    const imgSrc = shouldLazyLoad ? '' : optimizedUrl;
                    const dataSrc = shouldLazyLoad ? optimizedUrl : '';
                    
                    // placeholder를 img 태그로 교체
                    galleryItems[index].innerHTML = `
                        <img ${imgSrc ? `src="${imgSrc}"` : ''} ${dataSrc ? `data-src="${dataSrc}"` : ''} 
                             alt="${image.file_name}" 
                             loading="lazy" 
                             decoding="async"
                             style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-xl);">
                    `;
                }
            }
        });
        
        // 지연 로딩 설정
        setupGalleryPreviewLazyLoading();
        
        // 첫 번째 이미지 프리로딩
        if (selectedImages.length > 0) {
            const firstImageUrl = getOptimizedGalleryPreviewUrl(selectedImages[0].image_url, isMobile);
            preloadGalleryPreviewImage(firstImageUrl);
        }
        
        console.log(`✅ 갤러리 프리뷰 로드 완료: ${selectedImages.length}개 이미지 (최적화 적용)`);
        
    } catch (error) {
        console.error('갤러리 프리뷰 로드 실패:', error);
    }
}

// 갤러리 프리뷰 지연 로딩 설정
function setupGalleryPreviewLazyLoading() {
    if (!('IntersectionObserver' in window)) {
        return;
    }
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const optimizedUrl = img.dataset.src;
                
                if (optimizedUrl) {
                    img.src = optimizedUrl;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '100px 0px', // 100px 전에 미리 로딩
        threshold: 0.1
    });
    
    // 모든 lazy 이미지에 observer 적용
    document.querySelectorAll('.gallery-section img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// 갤러리 프리뷰 이미지 프리로딩
function preloadGalleryPreviewImage(url) {
    const img = new Image();
    img.src = url;
    img.loading = 'eager';
    img.decoding = 'async';
}

// 갤러리 프리뷰용 이미지 최적화 URL 생성 (로컬 경로는 그대로 반환)
function getOptimizedGalleryPreviewUrl(src, isMobile) {
    if (typeof src === 'string' && src.startsWith('/')) {
        return src;
    }
    try {
        const isLowEndDevice = navigator.hardwareConcurrency <= 4;
        const networkSpeed = detectNetworkSpeed();
        
        const url = new URL(src, window.location.origin);
        
        if (isMobile) {
            if (networkSpeed === 'slow' || isLowEndDevice) {
                // 느린 네트워크 또는 저사양 모바일: 극도로 작은 크기, 매우 낮은 품질
                url.searchParams.set('width', '200');
                url.searchParams.set('quality', '30');
                url.searchParams.set('format', 'webp');
            } else if (networkSpeed === 'medium') {
                // 중간 네트워크: 작은 크기, 낮은 품질
                url.searchParams.set('width', '250');
                url.searchParams.set('quality', '50');
                url.searchParams.set('format', 'webp');
            } else {
                // 빠른 네트워크: 적당한 크기, 중간 품질
                url.searchParams.set('width', '300');
                url.searchParams.set('quality', '65');
                url.searchParams.set('format', 'webp');
            }
        } else {
            // 데스크톱: 네트워크 속도에 따른 적응형 크기
            if (networkSpeed === 'slow') {
                url.searchParams.set('width', '400');
                url.searchParams.set('quality', '60');
            } else if (networkSpeed === 'medium') {
                url.searchParams.set('width', '500');
                url.searchParams.set('quality', '70');
            } else {
                url.searchParams.set('width', '600');
                url.searchParams.set('quality', '80');
            }
            url.searchParams.set('format', 'webp');
        }
        
        return url.toString();
        
    } catch (error) {
        console.warn('갤러리 프리뷰 이미지 최적화 실패, 원본 사용:', error);
        return src;
    }
}

// 네트워크 속도 감지 함수
function detectNetworkSpeed() {
    if ('connection' in navigator) {
        const connection = navigator.connection;
        const effectiveType = connection.effectiveType;
        
        switch (effectiveType) {
            case 'slow-2g':
            case '2g':
                return 'slow';
            case '3g':
                return 'medium';
            case '4g':
            default:
                return 'fast';
        }
    }
    return 'fast'; // 기본값
}

// 율무 운세 버튼 설정 (링크로 변경되어 별도 기능 불필요)
function setupFortuneButton() {
    // 버튼이 링크로 변경되어 fortune.html로 이동
    console.log('율무 운세 버튼 설정 완료 (링크 방식)');
}

// UTM 파라미터 제거 함수
function removeUTMParams(url) {
    try {
        const urlObj = new URL(url);
        const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        
        paramsToRemove.forEach(param => {
            urlObj.searchParams.delete(param);
        });
        
        return urlObj.toString();
    } catch (e) {
        // URL 파싱 실패 시 원본 반환
        return url;
    }
}

// 액션 버튼 설정 (공유하기, 문의하기)
function setupActionButtons() {
    const shareBtn = document.getElementById('shareBtn');
    
    if (shareBtn) {
        shareBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('공유 버튼 클릭됨');
            
            // UTM 파라미터 제거한 깨끗한 URL
            const cleanUrl = removeUTMParams(window.location.href);
            
            // 웹 공유 API 지원 여부 및 요구사항 확인
            console.log('navigator.share 존재:', !!navigator.share);
            console.log('현재 프로토콜:', window.location.protocol);
            console.log('현재 호스트:', window.location.host);
            console.log('HTTPS 여부:', window.location.protocol === 'https:');
            console.log('로컬호스트 여부:', window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            
            // 웹 공유 API 사용 가능한 경우
            if (navigator.share) {
                console.log('웹 공유 API 시도 중...');
                navigator.share({
                    title: '율무인데요 - 율무의 일상을 공유하는 유튜브 채널',
                    url: cleanUrl
                }).then(() => {
                    console.log('웹 공유 API 성공');
                }).catch(err => {
                    console.log('웹 공유 API 실패:', err);
                    fallbackShare(cleanUrl);
                });
            } else {
                // 웹 공유 API를 지원하지 않는 경우 대체 방법
                console.log('웹 공유 API 미지원, 대체 방법 사용');
                fallbackShare(cleanUrl);
            }
        });
    }
    
    console.log('액션 버튼 설정 완료');
}

// 대체 공유 방법 (클립보드 복사)
function fallbackShare(cleanUrl) {
    const url = cleanUrl || removeUTMParams(window.location.href);
    const text = '율무인데요 - 율무의 일상을 공유하는 유튜브 채널\n' + url;
    
    console.log('대체 공유 방법 실행');
    
    // 모바일 디바이스 확인
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    // 클립보드 API 사용
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('클립보드 복사 성공');
            // 모바일에서는 모달 표시하지 않음
            if (!isMobile) {
                showToast('링크가 클립보드에 복사되었습니다!');
            }
        }).catch(err => {
            console.log('클립보드 복사 실패:', err);
            // 대체 방법 시도
            tryLegacyCopy(text);
        });
    } else {
        // 레거시 방법 사용
        tryLegacyCopy(text);
    }
}

// 레거시 복사 방법
function tryLegacyCopy(text) {
    // 모바일 디바이스 확인
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    try {
        // 텍스트 영역 생성
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        // 복사 실행
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            console.log('레거시 복사 성공');
            // 모바일에서는 모달 표시하지 않음
            if (!isMobile) {
                showToast('링크가 클립보드에 복사되었습니다!');
            }
        } else {
            console.log('레거시 복사 실패');
            // 모바일에서는 모달 표시하지 않음
            if (!isMobile) {
                showToast('링크: ' + window.location.href);
            }
        }
    } catch (err) {
        console.log('레거시 복사 오류:', err);
        // 모바일에서는 모달 표시하지 않음
        if (!isMobile) {
            showToast('링크: ' + window.location.href);
        }
    }
}

// 토스트 메시지 표시
function showToast(message) {
    // 기존 토스트가 있으면 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 500;
        z-index: 10000;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        max-width: 90%;
        text-align: center;
    `;
    
    // CSS 애니메이션 추가
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                20% { opacity: 1; transform: translateX(-50%) translateY(0); }
                80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // 2초 후 자동 제거
    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 2000);
}

// GA4 이벤트 추적 설정
function setupGA4Tracking() {
    // 소셜 링크 클릭 추적
    setupSocialLinkTracking();
    // 인기 영상 클릭 추적
    setupVideoCardTracking();
    // 쿠팡 광고 박스 클릭 추적
    setupCoupangAdTracking();
}

// 소셜 링크 클릭 추적
function setupSocialLinkTracking() {
    // YouTube 버튼
    const youtubeBtn = document.querySelector('.youtube-btn');
    if (youtubeBtn) {
        youtubeBtn.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'youtube_button_click', {
                    'social_network': 'YouTube',
                    'button_name': '율무인데요 유튜브'
                });
            }
        });
    }

    // Instagram 버튼
    const instagramBtn = document.querySelector('.instagram-btn');
    if (instagramBtn) {
        instagramBtn.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'instagram_button_click', {
                    'social_network': 'Instagram',
                    'button_name': '율무인데요 인스타그램'
                });
            }
        });
    }

    // TikTok 버튼
    const tiktokBtn = document.querySelector('.tiktok-btn');
    if (tiktokBtn) {
        tiktokBtn.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'tiktok_button_click', {
                    'social_network': 'TikTok',
                    'button_name': '율무인데요 TIKTOK'
                });
            }
        });
    }
}

// 인기 영상 카드 클릭 추적
function setupVideoCardTracking() {
    // 이벤트 위임을 사용하여 동적으로 추가되는 카드도 추적
    const videoGrid = document.querySelector('.video-grid');
    if (!videoGrid) {
        console.warn('video-grid를 찾을 수 없습니다.');
        return;
    }
    
    videoGrid.addEventListener('click', function(e) {
        // 클릭된 요소가 video-card 내부에 있는지 확인
        const videoCard = e.target.closest('.video-card');
        if (!videoCard) return;
        
        // video-grid 내부의 모든 video-card를 찾아 인덱스 확인
        const allVideoCards = Array.from(videoGrid.querySelectorAll('.video-card'));
        const index = allVideoCards.indexOf(videoCard);
        
        if (index === -1) return;
        
        const videoTitle = videoCard.querySelector('.video-title')?.textContent || `인기영상 ${index + 1}`;
        const videoViews = videoCard.querySelector('.video-views')?.textContent || '알 수 없음';
        const videoRank = index + 1;
        
        // 인기 영상 순위별로 구분된 이벤트 이름 사용
        let eventName;
        if (videoRank === 1) {
            eventName = 'popular_video_1_click';
        } else if (videoRank === 2) {
            eventName = 'popular_video_2_click';
        } else if (videoRank === 3) {
            eventName = 'popular_video_3_click';
        } else {
            eventName = `popular_video_${videoRank}_click`;
        }
        
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                'video_title': videoTitle,
                'video_rank': videoRank,
                'video_views': videoViews,
                'video_category': '인기 영상'
            });
            console.log('GA4 이벤트 전송:', eventName, videoTitle);
        }
    });
    
    // 직접적인 클릭 이벤트도 추가 (기존 방식 유지)
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach((card, index) => {
        card.style.cursor = 'pointer'; // 클릭 가능한 요소임을 표시
        
        card.addEventListener('click', function(e) {
            const videoTitle = card.querySelector('.video-title')?.textContent || `인기영상 ${index + 1}`;
            const videoViews = card.querySelector('.video-views')?.textContent || '알 수 없음';
            const videoRank = index + 1;
            
            // 인기 영상 순위별로 구분된 이벤트 이름 사용
            let eventName;
            if (videoRank === 1) {
                eventName = 'popular_video_1_click';
            } else if (videoRank === 2) {
                eventName = 'popular_video_2_click';
            } else if (videoRank === 3) {
                eventName = 'popular_video_3_click';
            } else {
                eventName = `popular_video_${videoRank}_click`;
            }
            
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, {
                    'video_title': videoTitle,
                    'video_rank': videoRank,
                    'video_views': videoViews,
                    'video_category': '인기 영상'
                });
                console.log('GA4 이벤트 전송:', eventName, videoTitle);
            }
        });
    });
}

// 쿠팡 광고 박스 클릭 추적
function setupCoupangAdTracking() {
    const coupangAds = document.querySelectorAll('.coupang-ad-box');
    coupangAds.forEach((ad, index) => {
        const adNumber = index + 1;
        const adDescription = ad.querySelector('.ad-description')?.textContent?.trim() || `쿠팡 광고 ${adNumber}`;
        const adLink = ad.getAttribute('href') || '';
        
        ad.addEventListener('click', function() {
            let eventName;
            if (adNumber === 1) {
                eventName = 'coupang_ad_1_click';
            } else if (adNumber === 2) {
                eventName = 'coupang_ad_2_click';
            } else if (adNumber === 3) {
                eventName = 'coupang_ad_3_click';
            } else {
                eventName = `coupang_ad_${adNumber}_click`;
            }
            
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, {
                    'ad_number': adNumber,
                    'ad_description': adDescription,
                    'ad_link': adLink,
                    'ad_category': '쿠팡 파트너스'
                });
                console.log('GA4 이벤트 전송:', eventName, adDescription);
            }
        });
    });
}
