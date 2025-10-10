// Channel Configuration
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@yourchannel';
const TIKTOK_CHANNEL_URL = 'https://www.tiktok.com/@yourchannel';
const EMAIL_ADDRESS = 'iamyulmoo@naver.com';

// DOM Elements
const popularVideosContainer = document.getElementById('popular-videos');
const recentVideosContainer = document.getElementById('recent-videos');
const youtubeLink = document.getElementById('youtube-link');
const tiktokLink = document.getElementById('tiktok-link');
const backToTopBtn = document.getElementById('backToTop');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize all app functionality
function initializeApp() {
    setupEventListeners();
    setupBackToTopButton();
    setupSmoothScrolling();
}

// Setup event listeners
function setupEventListeners() {
    // Contact button
    const contactBtn = document.querySelector('.contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `mailto:${EMAIL_ADDRESS}`;
        });
    }
    
    // Social media buttons
    const youtubeBtn = document.querySelector('.youtube-btn');
    if (youtubeBtn) {
        youtubeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(YOUTUBE_CHANNEL_URL, '_blank');
        });
    }
    
    const tiktokBtn = document.querySelector('.tiktok-btn');
    if (tiktokBtn) {
        tiktokBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(TIKTOK_CHANNEL_URL, '_blank');
        });
    }
    
    // Video cards
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        card.addEventListener('click', () => {
            // Add visual feedback
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
            console.log('Video card clicked');
        });
    });
}

// Setup back to top button
function setupBackToTopButton() {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Setup smooth scrolling for navigation
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add button hover effects
document.addEventListener('DOMContentLoaded', function() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.contact-btn, .social-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});
