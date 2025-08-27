document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu functionality
    const menuBtn = document.getElementById('menu');
    const closeBtn = document.getElementById('close');
    const navbar = document.querySelector('.navbar');

    menuBtn.addEventListener('click', () => {
        navbar.classList.add('active');
        menuBtn.style.display = 'none';
        closeBtn.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        navbar.classList.remove('active');
        menuBtn.style.display = 'flex';
        closeBtn.style.display = 'none';
    });

    // Scroll animation with Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.fade-in').forEach(element => {
        observer.observe(element);
    });

   // Form submission
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');

    if (!form) {
        console.error('Form element not found!');
        return;
    }

    console.log('Form element found:', form);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submitted');
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');

        console.log('Form data:', { name, email, message });

        if (!name || !email || !message) {
            console.log('Validation failed: Missing fields');
            feedback.style.display = 'block';
            feedback.style.color = 'red';
            feedback.textContent = 'Please fill out all fields.';
            return;
        }

        try {
            console.log('Sending fetch request to /send');
            const response = await fetch('/send', {
                method: 'POST',
                body: formData,
            });
            console.log('Fetch response:', response);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                feedback.style.display = 'block';
                feedback.style.color = 'green';
                feedback.textContent = 'Message sent successfully!';
                form.reset();
                console.log('Form reset after success');
            } else {
                throw new Error(data.message || 'Failed to send');
            }
        } catch (error) {
            console.error('Fetch error:', error.message);
            feedback.style.display = 'block';
            feedback.style.color = 'red';
            feedback.textContent = `Error: ${error.message}`;
        }

        setTimeout(() => {
            feedback.style.display = 'none';
            console.log('Feedback hidden');
        }, 5000);
    });
});