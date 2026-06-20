// Initialize EmailJS with your Public Key
const EMAILJS_PUBLIC_KEY = "-yFWcCKSnWFhyazHM";
emailjs.init(EMAILJS_PUBLIC_KEY);

// Your EmailJS configuration
const EMAILJS_CONFIG = {
    serviceId: 'service_3s7uxlj',
    autoReplyTemplateId: 'template_q0ol9um', // Auto-reply to user
    notifyTemplateId: 'template_vjtmznj' // Notification template for you
};

// Mobile Menu Toggle
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Smooth Scrolling
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
            
            // Close mobile menu if open
            document.querySelector('.nav-links').classList.remove('active');
        }
    });
});

// Animate skill bars on scroll
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    skillBars.forEach(bar => {
        setTimeout(()=>{
        const width = bar.getAttribute('data-width');
        bar.style.width = width + '%';
        },1000);
    });
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Animate skill bars when they come into view
window.addEventListener('scroll', function() {
    const skillsSection = document.getElementById('skills');
    if (isInViewport(skillsSection)) {
        animateSkillBars();
    }
});

// Header background on scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 500) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// Contact Form Handler with EmailJS
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form form');
    
    if(contactForm) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form inputs using correct selectors from index.html
            const formInputs = document.querySelectorAll('.contact-form .form-control');
            
            const nameInput = formInputs[0];
            const emailInput = formInputs[1];
            const subjectInput = formInputs[2];
            const messageInput = formInputs[3];
            
            // Get values
            const userName = nameInput.value.trim();
            const userEmail = emailInput.value.trim();
            const userSubject = subjectInput.value.trim();
            const userMessage = messageInput.value.trim();
            
            // Basic validation
            if(!userName || !userEmail || !userMessage) {
                alert('Please fill in all required fields (Name, Email, and Message)');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!emailRegex.test(userEmail)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Show loading state
            const originalButtonText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            try {
                // 1. SEND AUTO-REPLY TO USER
                const autoReplyData = {
                    to_email: userEmail,
                    user_name: userName,
                    from_email: 'jasontonny80@gmail.com'
                };
                
                await emailjs.send(
                    EMAILJS_CONFIG.serviceId,
                    EMAILJS_CONFIG.autoReplyTemplateId,
                    autoReplyData
                );
                console.log('Auto-reply sent to user');
                
                // 2. SEND NOTIFICATION TO YOU
                const notifyData = {
                    to_email: 'jasontonny80@gmail.com',
                    from_name: userName,
                    from_email: userEmail,
                    subject: userSubject,
                    message: `
📩 New message from: ${userName}
📧 Email: ${userEmail}
📝 Subject: ${userSubject}

💬 Message:
${userMessage}

📅 Sent: ${new Date().toLocaleString()}

---
Reply to this email to respond to ${userName}
                    `
                };
                
                await emailjs.send(
                    EMAILJS_CONFIG.serviceId,
                    EMAILJS_CONFIG.notifyTemplateId,
                    notifyData
                );
                console.log('Notification sent to you');
                
                // Show success message
                alert('Thank you! Your message has been sent successfully. You will receive an auto-reply shortly.');
                
                // Reset form
                contactForm.reset();
                
            } catch (error) {
                console.error('Error sending email:', error);
                alert(`Sorry, there was an error sending your message. Please try again.\nError: ${error.text || error.message}`);
                
            } finally {
                // Reset button state
                submitBtn.textContent = originalButtonText;
                submitBtn.disabled = false;
            }
        });
    }
});
