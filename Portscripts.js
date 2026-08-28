// Import School Management System modules
import { SchoolAssistant } from './assistant.js';
import { SchoolWebsite } from './website.js';
import { SchoolData } from './data.js';
import { SchoolUI } from './ui.js';

// School Management System Controller
class SchoolManagementController {
    constructor() {
        this.assistant = new SchoolAssistant();
        this.website = new SchoolWebsite();
        this.data = new SchoolData();
        this.ui = new SchoolUI();
        this.isActive = false;
        this.returnButton = null;
    }

    async launch() {
        if (this.isActive) return;
        
        console.log('Launching School Management System...');
        
        const portfolioElements = document.querySelectorAll('header, section, footer, .galaxy-background');
        portfolioElements.forEach(el => {
            el.style.display = 'none';
        });
        
        const existingContainer = document.getElementById('schoolContainer');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        const schoolContainer = document.createElement('div');
        schoolContainer.id = 'schoolContainer';
        schoolContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 25%, #0d0d2b 50%, #1a0a2e 75%, #0a0a1a 100%);
            z-index: 99999;
            overflow-y: auto;
        `;
        document.body.appendChild(schoolContainer);
        
        // Create return button
        this.createReturnButton();
        
        try {
            await this.assistant.init();
            await this.assistant.showWelcomeMessage();
            
            const schoolInfo = await this.assistant.getSchoolInfo();
            console.log('School info received:', schoolInfo);
            
            await this.data.init(schoolInfo.name, schoolInfo.location);
            await this.website.generate(schoolInfo.name, schoolInfo.location, schoolContainer, this.data, this.assistant);
            
            this.isActive = true;
            console.log('School Management System launched successfully!');
        } catch (error) {
            console.error('Error launching school system:', error);
            portfolioElements.forEach(el => {
                el.style.display = '';
            });
            schoolContainer.remove();
            if (this.returnButton) {
                this.returnButton.remove();
                this.returnButton = null;
            }
        }
    }

    createReturnButton() {
        this.returnButton = document.createElement('button');
        this.returnButton.innerHTML = '<i class="fas fa-arrow-left"></i> Return to Portfolio';
        this.returnButton.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 999999;
            background: linear-gradient(135deg, #6C63FF, #FF6584);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 30px;
            cursor: pointer;
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            box-shadow: 0 5px 20px rgba(108, 99, 255, 0.4);
            transition: all 0.3s;
        `;
        this.returnButton.onmouseover = () => {
            this.returnButton.style.transform = 'translateY(-2px)';
            this.returnButton.style.boxShadow = '0 10px 30px rgba(108, 99, 255, 0.6)';
        };
        this.returnButton.onmouseout = () => {
            this.returnButton.style.transform = 'translateY(0)';
            this.returnButton.style.boxShadow = '0 5px 20px rgba(108, 99, 255, 0.4)';
        };
        this.returnButton.onclick = () => {
            this.exit();
        };
        document.body.appendChild(this.returnButton);
    }

    exit() {
        // Show portfolio content again
        const portfolioElements = document.querySelectorAll('header, section, footer, .galaxy-background');
        portfolioElements.forEach(el => {
            el.style.display = '';
        });
        
        // Remove school container
        const schoolContainer = document.getElementById('schoolContainer');
        if (schoolContainer) {
            schoolContainer.remove();
        }
        
        // Remove return button
        if (this.returnButton) {
            this.returnButton.remove();
            this.returnButton = null;
        }
        
        // Remove any remaining overlays
        const overlays = document.querySelectorAll('div[style*="rgba(0, 0, 0, 0.7)"]');
        overlays.forEach(overlay => overlay.remove());
        
        // Remove assistant if exists
        const assistantContainer = document.querySelector('.assistant-container');
        if (assistantContainer) {
            assistantContainer.remove();
        }
        
        this.isActive = false;
        console.log('Returned to portfolio');
    }
}

// Initialize School Management Controller
const schoolManager = new SchoolManagementController();

// Page Load Animation Sequence
window.addEventListener('load', function() {
    const totalDuration = 5000; // 5 seconds for loader intro
    const elements = document.querySelectorAll('[class*="slide-from"]');
    const loader = document.getElementById('pageLoader');
    
    console.log('Page loaded, starting intro sequence...');
    console.log('Elements to animate:', elements.length);
    
    // Lock scroll position during loader
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        console.log('Loader intro complete, starting scroll animation...');
        
        // Unlock scroll
        document.body.style.overflow = 'auto';
        
        // Fade out loader smoothly
        if (loader) {
            loader.classList.add('fade-out');
            console.log('Loader fading out');
            
            setTimeout(() => {
                loader.style.display = 'none';
                console.log('Loader removed from DOM');
            }, 500);
        }
        
        // Start the auto-scroll animation
        startScrollAnimation();
        
    }, totalDuration);
    
    function startScrollAnimation() {
        const scrollDuration = 5000;
        const scrollStartTime = Date.now();
        
        function autoScrollAnimation() {
            const elapsed = Date.now() - scrollStartTime;
            const progress = elapsed / scrollDuration;
            
            if (progress < 1) {
                let scrollPosition;
                
                if (progress < 0.5) {
                    const downProgress = progress * 2;
                    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                    scrollPosition = downProgress * maxScroll;
                } else {
                    const upProgress = (progress - 0.5) * 2;
                    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                    scrollPosition = (1 - upProgress) * maxScroll;
                }
                
                window.scrollTo(0, scrollPosition);
                checkAndActivateElements();
                
                requestAnimationFrame(autoScrollAnimation);
            } else {
                window.scrollTo(0, 0);
                
                elements.forEach(element => {
                    element.classList.add('active');
                });
                
                console.log('All elements activated');
                animateSkillBars();
                isInitialAnimationComplete = true;
                console.log('Initial animation sequence complete');
            }
        }
        
        autoScrollAnimation();
    }
    
    function checkAndActivateElements() {
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            
            if (rect.top < windowHeight - 50 && rect.bottom > 0 && rect.left < windowWidth && rect.right > 0) {
                if (!element.classList.contains('active')) {
                    element.classList.add('active');
                }
            }
        });
    }
});

// Project Click Handlers
document.addEventListener('click', function(e) {
    const projectLink = e.target.closest('.project-link');
    
    if (projectLink) {
        e.preventDefault();
        e.stopPropagation();
        
        const projectType = projectLink.getAttribute('data-project');
        console.log('Project clicked:', projectType);
        
        if (projectType === 'school-management') {
            console.log('Launching School Management System...');
            schoolManager.launch();
        } else if (projectType === 'business-management') {
            console.log('Business Management System clicked - not implemented yet');
            alert('Business Management System coming soon!');
        } else if (projectType === 'service-management') {
            console.log('Service Management System clicked - not implemented yet');
            alert('Service Management System coming soon!');
        }
    }
});

// Mobile Menu Toggle
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Smooth Scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            document.querySelector('.nav-links').classList.remove('active');
        }
    });
});

// Animate skill bars
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    skillBars.forEach((bar, index) => {
        setTimeout(() => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width + '%';
        }, index * 200);
    });
}

// Check if element is in viewport for regular scrolling
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Handle regular scrolling after initial animation
let isInitialAnimationComplete = false;

window.addEventListener('scroll', function() {
    if (isInitialAnimationComplete) {
        const slideElements = document.querySelectorAll('[class*="slide-from"]:not(.active)');
        slideElements.forEach(element => {
            if (isInViewport(element)) {
                element.classList.add('active');
            }
        });
        
        const skillsSection = document.getElementById('skills');
        if (isInViewport(skillsSection)) {
            animateSkillBars();
        }
    }
});

// Header background on scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 500) {
        header.style.background = 'rgba(10, 10, 26, 0.98)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    } else {
        header.style.background = 'rgba(10, 10, 26, 0.9)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    }
});

// Add escape key handler to exit school management system
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && schoolManager.isActive) {
        console.log('Exiting School Management System...');
        schoolManager.exit();
    }
});

console.log('Portfolio script loaded successfully');