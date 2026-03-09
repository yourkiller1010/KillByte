/* ============================================
   KILLBYTE PREMIUM - MAIN JAVASCRIPT
   Core Functionality
   ============================================ */

// Global State
const state = {
    isAdmin: false,
    currentLang: 'en',
    visitorCount: 0,
    menuOpen: false
};

// DOM Elements
const elements = {
    preloader: document.getElementById('preloader'),
    navbar: document.getElementById('navbar'),
    menuToggle: document.getElementById('menuToggle'),
    mobileMenu: document.getElementById('mobileMenu'),
    redirectOverlay: document.getElementById('redirectOverlay'),
    adminModal: document.getElementById('adminModal'),
    adminPanel: document.getElementById('adminPanel')
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initNavbar();
    initMobileMenu();
    initScrollAnimations();
    initCounterAnimations();
    initTierTabs();
    initBackgroundCanvas();
    updateLoginTime();
});

// ============================================
// PRELOADER
// ============================================
function initPreloader() {
    const preloader = elements.preloader;
    if (!preloader) return;

    // Update status text
    const statusEl = preloader.querySelector('.preloader-status');
    const statuses = [
        'Initializing systems...',
        'Loading modules...',
        'Connecting to nodes...',
        'Ready'
    ];

    let statusIndex = 0;
    const statusInterval = setInterval(() => {
        statusIndex++;
        if (statusEl && statusIndex < statuses.length) {
            statusEl.textContent = statuses[statusIndex];
        }
    }, 400);

    // Hide preloader after animation
    setTimeout(() => {
        clearInterval(statusInterval);
        preloader.classList.add('hidden');
        
        // Remove from DOM after transition
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 600);
    }, 2200);
}

// ============================================
// NAVBAR
// ============================================
function initNavbar() {
    const navbar = elements.navbar;
    if (!navbar) return;

    // Scroll handler
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add/remove scrolled class
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active nav link
        updateActiveNavLink();

        lastScroll = currentScroll;
    });

    // Smooth scroll for nav links
    document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 80;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

function updateActiveNavLink() {
    const sections = ['home', 'terminal', 'tiers', 'plans', 'enterprise', 'support'];
    const scrollPos = window.pageYOffset + 100;

    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const top = section.offsetTop;
            const height = section.offsetHeight;

            if (scrollPos >= top && scrollPos < top + height) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        }
    });
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
    const menuToggle = elements.menuToggle;
    const mobileMenu = elements.mobileMenu;

    if (!menuToggle || !mobileMenu) return;

    menuToggle.addEventListener('click', () => {
        state.menuOpen = !state.menuOpen;
        mobileMenu.classList.toggle('active', state.menuOpen);
        
        // Animate hamburger
        const spans = menuToggle.querySelectorAll('span');
        if (state.menuOpen) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

function closeMobileMenu() {
    state.menuOpen = false;
    elements.mobileMenu.classList.remove('active');
    
    const spans = elements.menuToggle.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe scroll-reveal elements
    document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// COUNTER ANIMATIONS
// ============================================
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseFloat(counter.dataset.count);
                const duration = 2000;
                const start = performance.now();
                
                const updateCounter = (currentTime) => {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Easing function
                    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                    const current = target * easeOutQuart;
                    
                    if (target % 1 === 0) {
                        counter.textContent = Math.floor(current);
                    } else {
                        counter.textContent = current.toFixed(1);
                    }
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                requestAnimationFrame(updateCounter);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

// ============================================
// TIER TABS
// ============================================
function initTierTabs() {
    const tabs = document.querySelectorAll('.tier-tab');
    const contents = document.querySelectorAll('.tier-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tier = tab.dataset.tier;

            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update contents
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tier-${tier}`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// ============================================
// BACKGROUND CANVAS
// ============================================
function initBackgroundCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    // Resize canvas
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width || 
                this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Initialize particles
    function initParticles() {
        particles = [];
        const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Draw connections
    function drawConnections() {
        const maxDistance = 100;
        const maxConnections = 3;

        for (let i = 0; i < particles.length; i++) {
            let connections = 0;
            
            for (let j = i + 1; j < particles.length; j++) {
                if (connections >= maxConnections) break;

                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                    connections++;
                }
            }
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        drawConnections();
        animationId = requestAnimationFrame(animate);
    }

    // Initialize
    resize();
    initParticles();
    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        resize();
        initParticles();
    });

    // Pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animate();
        }
    });
}

// ============================================
// SUPPORT REDIRECT
// ============================================
function openSupport() {
    const overlay = elements.redirectOverlay;
    if (!overlay) return;

    overlay.classList.add('active');

    setTimeout(() => {
        window.open('https://t.me/KillByte_Support_Bot', '_blank');
        overlay.classList.remove('active');
    }, 2000);
}

// ============================================
// BUY FUNCTIONS
// ============================================
function buyPlan(plan) {
    window.open(`https://t.me/rankflood?text=I'm interested in the ${plan} plan`, '_blank');
}

function buyAddon(addon) {
    window.open(`https://t.me/rankflood?text=I'm interested in the ${addon} addon`, '_blank');
}

// ============================================
// ADMIN PANEL
// ============================================
function openAdminModal() {
    elements.adminModal.classList.add('active');
    document.getElementById('adminPassword').focus();
}

function closeAdminModal() {
    elements.adminModal.classList.remove('active');
    document.getElementById('adminPassword').value = '';
}

function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    const correctPassword = 'killbyte1337';

    if (password === correctPassword) {
        state.isAdmin = true;
        closeAdminModal();
        elements.adminPanel.classList.add('active');
        
        // Load admin data
        if (typeof loadAdminData === 'function') {
            loadAdminData();
        }
        
        showNotification('Admin access granted', 'success');
    } else {
        showNotification('Invalid password', 'error');
        document.getElementById('adminPassword').value = '';
    }
}

function adminLogout() {
    state.isAdmin = false;
    elements.adminPanel.classList.remove('active');
    showNotification('Logged out', 'info');
}

function switchAdminTab(tab, element) {
    // Update nav items
    document.querySelectorAll('.admin-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    element.classList.add('active');

    // Update tab content
    document.querySelectorAll('.admin-tab').forEach(tabContent => {
        tabContent.classList.remove('active');
    });
    document.getElementById(`tab-${tab}`).classList.add('active');
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info'}"></i>
        </div>
        <div class="notification-text">${message}</div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 24px;
        background: #161616;
        border: 1px solid #2a2a2a;
        border-radius: 12px;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 14px;
        z-index: 9999;
        transform: translateX(150%);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
    `;

    document.body.appendChild(notification);

    // Show notification
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });

    // Hide after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => {
            notification.remove();
        }, 400);
    }, 3000);
}

// ============================================
// LEGAL MODALS
// ============================================
function showTerms() {
    alert(`Terms of Service:

1. Authorized testing only
2. Compliance with local laws required
3. No refunds after delivery
4. Misuse results in termination

Contact @rankflood for full terms.`);
}

function showPrivacy() {
    alert(`Privacy Policy:

We collect minimal data necessary for service operation.
No attack target logs are kept.
Payment data is encrypted.

Contact @rankflood for full policy.`);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function updateLoginTime() {
    const loginTimeEl = document.getElementById('loginTime');
    if (loginTimeEl) {
        const now = new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const day = days[now.getDay()];
        const month = months[now.getMonth()];
        const date = now.getDate();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        loginTimeEl.textContent = `${day} ${month} ${date} ${hours}:${minutes}:${seconds}`;
    }
}

// Update login time every second
setInterval(updateLoginTime, 1000);

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    // Escape to close modals
    if (e.key === 'Escape') {
        closeAdminModal();
        closeMobileMenu();
        
        if (elements.redirectOverlay.classList.contains('active')) {
            elements.redirectOverlay.classList.remove('active');
        }
    }

    // Admin shortcut (Ctrl + Shift + A)
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        openAdminModal();
    }
});

// ============================================
// CONSOLE EASTER EGG
// ============================================
console.log('%c KillByte Infrastructure ', 'background: linear-gradient(135deg, #fff, #888); color: #000; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 8px;');
console.log('%c Welcome to the console! ', 'color: #888; font-size: 14px;');
console.log('%c Admin: @rankflood ', 'color: #fff; font-size: 12px;');
