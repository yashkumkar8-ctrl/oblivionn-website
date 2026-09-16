/**
 * Yash Kumkar — Web Developer Portfolio Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation Scroll Effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            navMenu.classList.toggle('open');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                navMenu.classList.remove('open');
            });
        });
    }

    // 3. Ambient Particle Background Canvas
    const canvas = document.getElementById('ambient-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        });

        const particles = [];
        const particleCount = Math.min(Math.floor(width / 25), 45);

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 0.6;
                this.speedY = (Math.random() - 0.5) * 0.6;
                this.alpha = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > width) this.speedX *= -1;
                if (this.y < 0 || this.y > height) this.speedY *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 240, 255, ${this.alpha})`;
                ctx.fill();
            }
        }

        function initParticles() {
            particles.length = 0;
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        initParticles();

        function animate() {
            ctx.clearRect(0, 0, width, height);

            // Connect nearby particles with delicate faint lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            requestAnimationFrame(animate);
        }

        animate();
    }

    // 4. Project Filter Tabs
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    card.style.opacity = '1';
                } else {
                    card.style.display = 'none';
                    card.style.opacity = '0';
                }
            });
        });
    });

    // 5. Contact Form Submission (Direct to Gmail via FormSubmit.co)
    const contactForm = document.getElementById('contact-form');
    const formToast = document.getElementById('form-toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastText = document.getElementById('toast-text');

    if (contactForm && formToast) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('client-name').value.trim();
            const email = document.getElementById('client-email').value.trim();
            const projectType = document.getElementById('project-type').value;
            const message = document.getElementById('project-message').value.trim();

            const submitBtn = document.getElementById('submit-btn');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending to Gmail...`;

            try {
                const response = await fetch('https://formsubmit.co/ajax/yashkumkar8@gmail.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        Name: name,
                        Email: email,
                        Requirement: projectType,
                        Message: message,
                        _subject: `🚀 Portfolio Inquiry: ${name} (${projectType})`,
                        _replyto: email
                    })
                });

                const data = await response.json();
                formToast.style.display = 'flex';

                if (data.success === "true" || data.success === true) {
                    formToast.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                    formToast.style.color = '#10b981';
                    if (toastIcon) toastIcon.className = 'fa-solid fa-circle-check';
                    if (toastText) toastText.textContent = 'Awesome! Your message has been sent directly to yashkumkar8@gmail.com. Yash will reply shortly!';
                    contactForm.reset();
                    submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Sent to Gmail!`;
                } else if (data.message && data.message.includes('Activation')) {
                    formToast.style.borderColor = 'rgba(245, 158, 11, 0.5)';
                    formToast.style.color = '#f59e0b';
                    if (toastIcon) toastIcon.className = 'fa-solid fa-envelope-circle-check';
                    if (toastText) toastText.textContent = 'Activation Required: Please check yashkumkar8@gmail.com and click "Activate Form" once to complete setup!';
                    submitBtn.innerHTML = `<i class="fa-solid fa-envelope"></i> Check Gmail to Activate`;
                } else {
                    formToast.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                    formToast.style.color = '#10b981';
                    if (toastIcon) toastIcon.className = 'fa-solid fa-circle-check';
                    if (toastText) toastText.textContent = 'Thank you! Your message was sent to yashkumkar8@gmail.com.';
                    contactForm.reset();
                    submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Sent!`;
                }
            } catch (err) {
                console.error('Submission error:', err);
                formToast.style.display = 'flex';
                formToast.style.borderColor = 'rgba(0, 240, 255, 0.4)';
                formToast.style.color = '#00f0ff';
                if (toastIcon) toastIcon.className = 'fa-solid fa-envelope-open-text';
                if (toastText) toastText.innerHTML = `Opening email app to send directly to <strong>yashkumkar8@gmail.com</strong>...`;

                const mailtoUrl = `mailto:yashkumkar8@gmail.com?subject=${encodeURIComponent('Portfolio Inquiry: ' + projectType)}&body=${encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message)}`;
                window.location.href = mailtoUrl;

                submitBtn.innerHTML = `<i class="fa-solid fa-envelope"></i> Opened Mail App`;
            }

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }, 6000);
        });
    }

    // 6. Active Nav Link on Scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.pageYOffset + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});
