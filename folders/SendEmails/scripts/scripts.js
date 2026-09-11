 // Initialize EmailJS with your Public Key
// Get this from: EmailJS Dashboard → Account → API Keys
const EMAILJS_PUBLIC_KEY = "-yFWcCKSnWFhyazHM"; // Replace with your actual public key
emailjs.init(EMAILJS_PUBLIC_KEY);

// Your EmailJS configuration
const EMAILJS_CONFIG = {
    serviceId: 'service_3s7uxlj', // Your service ID
    templateId: 'template_q0ol9um' // Replace with your template ID
};

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = contactForm.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        btnText.textContent = 'Sending...';
        spinner.classList.remove('hidden');
        submitBtn.disabled = true;
        
        // Hide any previous messages
        successMessage.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        try {
            // Get form data
            const formData = {
                from_name: document.getElementById('from_name').value,
                from_email: document.getElementById('from_email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                to_email: 'jasontonny80@gmail.com' // Replace with recipient email
            };
            
            // Send email using EmailJS
            const response = await emailjs.send(
                EMAILJS_CONFIG.serviceId,
                EMAILJS_CONFIG.templateId,
                formData
            );
            
            console.log('Email sent successfully:', response);
            
            // Show success message
            successMessage.classList.remove('hidden');
            
            // Reset form
            contactForm.reset();
            
        } catch (error) {
            console.error('Error sending email:', error);
            
            // Show error message
            errorMessage.textContent = `✗ Error: ${error.text || 'Failed to send email'}`;
            errorMessage.classList.remove('hidden');
            
        } finally {
            // Reset button state
            btnText.textContent = 'Send Email';
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });
});