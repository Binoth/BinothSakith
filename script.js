// 1. TYPEWRITER
const textElement = document.getElementById('typewriter');
const phrases = ["Software Engineer", "Angular Developer", "UI/UX Designer"];
let phraseIndex = 0, charIndex = 0, isDeleting = false;

function type() {
    const currentPhrase = phrases[phraseIndex];
    if (isDeleting) {
        textElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        textElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }
    let typeSpeed = isDeleting ? 50 : 100;
    if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true; typeSpeed = 2000;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; typeSpeed = 500;
    }
    setTimeout(type, typeSpeed);
}

// 2. FETCH PROJECTS
async function loadProjects() {
    try {
        const response = await fetch('projects.json');
        const projects = await response.json();
        const container = document.getElementById('project-grid');
        container.innerHTML = '';

        projects.forEach((project, index) => {
            const tagsHTML = (project.techStack || [])
                .map(tag => `<span class="project-tag">${tag}</span>`)
                .join('');

            const liveLink = project.links?.live && project.links.live !== "#"
                ? `<a class="project-link primary" href="${project.links.live}" target="_blank" rel="noopener">Live Demo <span class="link-icon">↗</span></a>`
                : '';

            const codeLink = project.links?.code
                ? `<a class="project-link" href="${project.links.code}" target="_blank" rel="noopener">View Code <span class="link-icon">⧉</span></a>`
                : '';

            const linksHTML = (liveLink || codeLink)
                ? `<div class="project-links">${liveLink}${codeLink}</div>`
                : '';

            container.innerHTML += `
                <article class="card card-3d hidden" style="transition-delay: ${index * 100}ms">
                    ${tagsHTML ? `<div class="project-tags">${tagsHTML}</div>` : ''}
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    ${linksHTML}
                </article>
            `;
        });
        
        initScrollReveal();
        init3DTilt(); 

    } catch (error) { console.error('JSON Error:', error); }
}

// 3. 3D TILT
function init3DTilt() {
    const cards = document.querySelectorAll('.card-3d');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -10; 
            const rotateY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

// 4. SCROLL REVEAL
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) entry.target.classList.add('show');
        });
    });
    document.querySelectorAll('.hidden').forEach(el => observer.observe(el));
}

// 5. SCROLL SPY FOR NAVIGATION
function initScrollSpy() {
    const navLinks = Array.from(document.querySelectorAll('nav a'));
    const sections = navLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if (!navLinks.length || !sections.length) return;

    const activateLink = (id) => {
        navLinks.forEach(link => {
            if (link.getAttribute('href') === id) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -55%',
        threshold: 0.25
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activateLink(`#${entry.target.id}`);
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));
}

document.addEventListener('DOMContentLoaded', () => {
    type();
    loadProjects();
    initScrollSpy();
});













const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');

// --- Configuration ---
const config = {
    particleColor: '#FFD700', // Yellow dots
    lineColor: '255, 140, 0', // Orange lines (RGB format for opacity calculation)
    particleAmount: 80,       // Number of dots
    defaultSpeed: 0.5,        // How fast they float
    linkDistance: 150         // Max distance to draw a line
};

let particles = [];
let w, h;

// --- Resize Handling ---
function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- Particle Class ---
class Particle {
    constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        // Random velocity
        this.vx = (Math.random() - 0.5) * config.defaultSpeed;
        this.vy = (Math.random() - 0.5) * config.defaultSpeed;
        this.size = Math.random() * 2 + 1; // Random size between 1 and 3
    }

    update() {
        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = config.particleColor;
        ctx.fill();
    }
}

// --- Initialization ---
function init() {
    particles = [];
    for (let i = 0; i < config.particleAmount; i++) {
        particles.push(new Particle());
    }
}

// --- Animation Loop ---
function animate() {
    ctx.clearRect(0, 0, w, h);

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Draw connections
        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < config.linkDistance) {
                // Calculate opacity based on distance (closer = brighter)
                const opacity = 1 - (distance / config.linkDistance);
                
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${config.lineColor}, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}

// Start
init();
animate();