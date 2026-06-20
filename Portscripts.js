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

        // Contact Form Handler
        const contactForm = document.querySelector('.contact-form form');
        if(contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get form inputs using correct selectors from index.html
                const formInputs = document.querySelectorAll('.contact-form .form-control');
                
                const nameInput = formInputs[0];
                const emailInput = formInputs[1];
                const subjectInput = formInputs[2];
                const messageInput = formInputs[3];
                
                // Get values
                const name = nameInput.value.trim();
                const email = emailInput.value.trim();
                const subject = subjectInput.value.trim();
                const message = messageInput.value.trim();
                
                // Basic validation
                if(!name || !email || !message) {
                    alert('Please fill in all required fields (Name, Email, and Message)');
                    return;
                }
                
                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(!emailRegex.test(email)) {
                    alert('Please enter a valid email address');
                    return;
                }
                
                // If validation passes, you can send the form data here
                console.log('Form Data:', {
                    name: name,
                    email: email,
                    subject: subject,
                    message: message
                });
                
                // Success message
                alert('Thank you! Your message has been sent successfully.');
                
                // Clear form
                contactForm.reset();
            });
        }
