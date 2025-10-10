// YouTube API Configuration
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY';
const CHANNEL_ID = 'YOUR_CHANNEL_ID';
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@yourchannel';
const TIKTOK_CHANNEL_URL = 'https://www.tiktok.com/@yourchannel';

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
    youtubeLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(YOUTUBE_CHANNEL_URL, '_blank');
    });
    
    tiktokLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(TIKTOK_CHANNEL_URL, '_blank');
    });
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
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

// Add click events to video cards
document.addEventListener('DOMContentLoaded', function() {
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        card.addEventListener('click', () => {
            // Add your video URL logic here
            console.log('Video card clicked');
        });
    });
});
