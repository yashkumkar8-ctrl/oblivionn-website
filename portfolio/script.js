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

    // 5. Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    const formToast = document.getElementById('form-toast');

    if (contactForm && formToast) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('client-name').value.trim();
            const email = document.getElementById('client-email').value.trim();
            const projectType = document.getElementById('project-type').value;
            const message = document.getElementById('project-message').value.trim();

            const submitBtn = document.getElementById('submit-btn');
            const originalBtnText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing...`;

            setTimeout(() => {
                formToast.style.display = 'flex';
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Message Prepared!`;

                // Optional: trigger mailto link so user can send immediately from their mail client
                const mailSubject = encodeURIComponent(`Web Dev Project Inquiry from ${name}`);
                const mailBody = encodeURIComponent(`Hi Yash,\n\nRequirement: ${projectType}\nEmail: ${email}\n\nProject Details:\n${message}`);
                
                // Keep toast visible
                setTimeout(() => {
                    window.open(`https://www.fiverr.com/yashkumkar2105`, '_blank');
                }, 1200);

                contactForm.reset();
                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnText;
                }, 4000);
            }, 800);
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
