/**
 * Bridged Loop - Core Cyberpunk Effects Suite
 * Vanilla JS (60 FPS Performance Optimized)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTextScramble();
    initCyberCursor();
    initTiltCards();
});

/* ==========================================================================
   1. EFECTO TEXT SCRAMBLE / DECODIFICADOR TIPO TERMINAL
   Uso: añade data-scramble a cualquier título o texto.
   Ejemplo: <h1 data-scramble>LANDING PAGES FUTURISTAS</h1>
   ========================================================================== */
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = 'QWERTYUIOPASDFGHZXCVBNM0123456789$#%*+~_';
        this.isAnimating = false;
        this.targetText = el.getAttribute('data-scramble') || el.innerText.trim();
        this.update = this.update.bind(this);
    }

    setText(newText, duration = 500) {
        if (this.isAnimating) return Promise.resolve();
        this.isAnimating = true;

        const target = newText || this.targetText;
        this.targetText = target;
        const length = target.length;
        this.queue = [];

        for (let i = 0; i < length; i++) {
            const to = target[i];
            if (to === ' ' || to === '\n') {
                this.queue.push({ to, isSpace: true, start: 0, end: 0, char: to });
            } else {
                const start = Math.floor(Math.random() * (duration * 0.25));
                const end = start + Math.floor((duration - start) * (0.6 + Math.random() * 0.4));
                this.queue.push({
                    to,
                    isSpace: false,
                    start,
                    end: Math.min(duration, Math.max(end, duration * 0.55)),
                    char: ''
                });
            }
        }

        cancelAnimationFrame(this.frameRequest);
        this.startTime = performance.now();
        this.duration = duration;

        return new Promise((resolve) => {
            this.resolve = resolve;
            this.update();
        });
    }

    update() {
        const now = performance.now();
        const elapsed = now - this.startTime;
        let output = '';
        let complete = 0;

        for (let i = 0; i < this.queue.length; i++) {
            const item = this.queue[i];

            if (item.isSpace) {
                output += item.to;
                complete++;
                continue;
            }

            if (elapsed >= this.duration || elapsed >= item.end) {
                complete++;
                output += item.to;
            } else if (elapsed >= item.start) {
                if (!item.char || Math.random() < 0.18) {
                    item.char = this.randomChar();
                }
                output += `<span class="scramble-glitch">${item.char}</span>`;
            } else {
                output += item.to;
            }
        }

        this.el.innerHTML = output;

        if (complete === this.queue.length || elapsed >= this.duration) {
            this.el.textContent = this.targetText;
            this.isAnimating = false;
            if (this.resolve) this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

function initTextScramble() {
    const elements = document.querySelectorAll('[data-scramble]');
    elements.forEach((el) => {
        const fx = new TextScramble(el);
        const originalText = el.getAttribute('data-scramble') || el.innerText.trim();
        setTimeout(() => {
            fx.setText(originalText, 500);
        }, 150);

        let hoverLock = false;
        el.addEventListener('mouseenter', () => {
            if (!hoverLock && !fx.isAnimating) {
                hoverLock = true;
                fx.setText(originalText, 500);
                setTimeout(() => {
                    hoverLock = false;
                }, 600);
            }
        });
    });
}

/* ==========================================================================
   2. CURSOR INTERACTIVO TIPO MIRA HUD
   ========================================================================== */
function initCyberCursor() {
    // Solo en dispositivos con puntero fino (evita fallos en pantallas táctiles)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const dot = document.createElement('div');
    const ring = document.createElement('div');

    dot.className = 'cyber-cursor-dot';
    ring.className = 'cyber-cursor-ring';

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });

    // Animación fluida con interpolación para el anillo exterior
    function renderCursor() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Expansión al interactuar con enlaces o botones
    const interactives = document.querySelectorAll('a, button, input, textarea, .card-tilt');
    interactives.forEach((item) => {
        item.addEventListener('mouseenter', () => ring.classList.add('cursor-active'));
        item.addEventListener('mouseleave', () => ring.classList.remove('cursor-active'));
    });
}

/* ==========================================================================
   3. INCLINACIÓN 3D REACTIVA EN TARJETAS (PORTAFOLIO / SERVICIOS)
   Uso: añade class="card-tilt" al contenedor de la tarjeta
   ========================================================================== */
function initTiltCards() {
    const cards = document.querySelectorAll('.card-tilt');

    cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -7;
            const rotateY = ((x - centerX) / centerX) * 7;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

            // Actualiza variable CSS para borde de luz reflectante
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
}