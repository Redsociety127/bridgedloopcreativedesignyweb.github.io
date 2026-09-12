/**
 * Bridged Loop - Zero Gravity Physics Engine with Web Audio Effects
 * Powered by Matter.js & Web Audio API
 * Soporta todos los elementos de index.html, nosotros.html, portafolio.html, contacto.html y terminosycondiciones.html
 */

document.addEventListener('DOMContentLoaded', () => {
    createGravityButton();
});

let isGravityActive = false;
let engine, runner;
let physicsElements = [];
let audioCtx = null;

/* ==========================================================================
   1. SINTETIZADOR DE AUDIO (Web Audio API)
   ========================================================================== */
function initAudio() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playBoingSound(intensity = 1) {
    if (!audioCtx) return;

    try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        const baseFreq = 220 + Math.random() * 80;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.18);

        const volume = Math.min(0.25, Math.max(0.04, intensity * 0.03));
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.19);
    } catch (e) { }
}

function playActivationSound() {
    if (!audioCtx) return;

    try {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
    } catch (e) { }
}

/* ==========================================================================
   2. CONTROL DE LA UI Y BOTÓN FLOTANTE
   ========================================================================== */
function createGravityButton() {
    if (document.getElementById('gravity-toggle-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'gravity-toggle-btn';
    btn.innerHTML = `
        <span class="gravity-icon">✦</span>
        <span class="gravity-text">ACTIVAR MODO GRAVEDAD ZERO</span>
    `;
    btn.setAttribute('aria-label', 'Activar físicas interactivas');
    document.body.appendChild(btn);

    btn.addEventListener('click', toggleZeroGravity);
}

function toggleZeroGravity() {
    initAudio();
    const btn = document.getElementById('gravity-toggle-btn');
    const btnText = btn?.querySelector('.gravity-text');

    if (!isGravityActive) {
        if (typeof Matter === 'undefined') {
            console.warn('Matter.js no está cargado en la página.');
            return;
        }
        isGravityActive = true;
        if (btnText) btnText.innerText = 'RESTAURAR GRAVEDAD';
        btn?.classList.add('gravity-active');
        document.body.style.overflow = 'hidden';
        playActivationSound();
        startPhysics();
    } else {
        isGravityActive = false;
        if (btnText) btnText.innerText = 'ACTIVAR MODO GRAVEDAD ZERO';
        btn?.classList.remove('gravity-active');
        document.body.style.overflow = '';
        playActivationSound();
        stopPhysics();
    }
}

/* ==========================================================================
   3. RECOLECCIÓN DE TODOS LOS ELEMENTOS DEL DOM
   ========================================================================== */
function getTargetElements() {
    // Selectores para capturar todos los componentes, tarjetas, textos, botones, imágenes y módulos
    const candidateSelectors = [
        // --- 1. Módulos, Tarjetas y Estructuras Autónomas ---
        '.cyber-card',
        '.project-card',
        '.stat-matrix-card',
        '.legal-card',
        '.cta-card',
        '.value-card',
        '.process-step',
        '.team-card',
        '.contact-card',
        '.telemetry-item',
        '.terminal-group',
        '.terminal-header',
        '.terminal-logs',
        '.terminal-terms-group',
        '.terminal-btn',
        '.terminal-submit-btn',
        '.legal-contact-callout',
        '.legal-table-wrapper',
        '.terminal-hint-box',
        '.showcase-sidebar',
        '.showcase-brief',
        '.showcase-header-tag',

        // --- 2. Navbar & Cabecera ---
        '.nav-brand',
        '.nav-links > li',
        '.nav-actions > a',
        '.nav-actions > button:not(#gravity-toggle-btn)',
        '.mobile-toggle',

        // --- 3. Badges, Tags, Filtros y Chips ---
        '.badge-hud',
        '.hero-badge',
        '.section-tag',
        '.tag-cyan',
        '.status-dot',
        '.quick-nav-pill',
        '.quick-nav-label',
        '.filter-btn',
        '.hud-status-chip',
        '.showcase-id-badge',
        '.client-badge-label',

        // --- 4. Títulos, Subtítulos y Bloques de Texto ---
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        '.hero-title',
        '.hero-subtitle',
        '.section-title',
        '.section-desc',
        '.card-title',
        '.card-desc',
        'p',
        'blockquote',

        // --- 5. Botones, Enlaces y Llamadas a la Acción ---
        '.hero-cta-group > a',
        '.hero-cta-group > button',
        '.cyber-btn:not(#gravity-toggle-btn)',
        'a.cyber-btn',
        'button.cyber-btn:not(#gravity-toggle-btn)',
        'button:not(#gravity-toggle-btn):not(.terminal-checkbox)',
        'a:not(#gravity-toggle-btn)',

        // --- 6. Medios, Gráficos e Iconos ---
        'img',
        'video:not(.hero-video-bg)',
        '.brand-logo-wrapper',
        '.brand-logo-img',
        '.hero-avatar',
        '.card-icon',
        '.footer-logo-wrapper',

        // --- 7. Formularios y Campos ---
        'input:not([type="hidden"])',
        'textarea',
        'select',
        '.form-group',

        // --- 8. Footer Global ---
        '.footer-brand',
        '.footer-brand-desc',
        '.footer-badge-hud',
        '.footer-col',
        '.footer-heading',
        '.footer-links > li',
        '.footer-bottom > div'
    ];

    const rawElements = [];
    const seen = new Set();

    candidateSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            // Exclusiones críticas
            if (el.closest('#gravity-toggle-btn')) return;
            if (el.id === 'cyber-canvas' || el.classList.contains('scanlines-overlay')) return;
            if (el.tagName === 'BODY' || el.tagName === 'HTML' || el.tagName === 'MAIN' || el.tagName === 'SECTION') return;
            if (el.classList.contains('container') || el.classList.contains('cyber-grid') || el.classList.contains('legal-content-flow')) return;

            if (!seen.has(el)) {
                seen.add(el);
                rawElements.push(el);
            }
        });
    });

    // Filtramos para conservar los bloques principales sin desmembrar tarjetas completas
    const targetElements = rawElements.filter(el => {
        for (const other of rawElements) {
            if (other !== el && other.contains(el)) {
                return false; // Si su contenedor ya es un cuerpo rígido, no duplicamos
            }
        }
        return true;
    });

    return targetElements;
}

/* ==========================================================================
   4. MOTOR FÍSICO (MATTER.JS) Y SIMULACIÓN
   ========================================================================== */
function startPhysics() {
    const { Engine, Bodies, Composite, Mouse, MouseConstraint, Runner, Events } = Matter;

    engine = Engine.create();
    engine.gravity.y = 0.08; // Gravedad zero suave con caída ligera estética
    engine.gravity.x = 0;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Paredes perimétricas para contener todos los elementos en la ventana visible
    const wallThickness = 120;
    const ground = Bodies.rectangle(width / 2, height + wallThickness / 2, width * 2, wallThickness, { isStatic: true });
    const ceiling = Bodies.rectangle(width / 2, -wallThickness / 2, width * 2, wallThickness, { isStatic: true });
    const leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true });
    const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true });

    Composite.add(engine.world, [ground, ceiling, leftWall, rightWall]);

    const targets = getTargetElements();
    physicsElements = [];

    targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        // Guardamos el estilo original
        el.dataset.origStyle = el.getAttribute('style') || '';

        // Creamos cuerpo físico rectangular correspondiente a las dimensiones exactas
        const body = Bodies.rectangle(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            rect.width,
            rect.height,
            {
                restitution: 0.85, // Rebote dinámico
                frictionAir: 0.02,  // Deslizamiento aeroespacial
                friction: 0.08
            }
        );

        // Convertimos el elemento visual a capa fija
        el.style.position = 'fixed';
        el.style.left = '0px';
        el.style.top = '0px';
        el.style.width = `${rect.width}px`;
        el.style.height = `${rect.height}px`;
        el.style.margin = '0';
        el.style.zIndex = '9000';
        el.style.userSelect = 'none';
        el.style.pointerEvents = 'auto';
        el.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0px) rotate(0rad)`;

        Composite.add(engine.world, body);
        physicsElements.push({ el, body, rect });
    });

    // Manejo de sonido de colisiones dinámicas
    let lastSoundTime = 0;
    Events.on(engine, 'collisionStart', (event) => {
        const now = Date.now();
        if (now - lastSoundTime > 60) {
            const pair = event.pairs[0];
            if (pair) {
                const speedA = pair.bodyA.speed || 0;
                const speedB = pair.bodyB.speed || 0;
                const relativeSpeed = Math.max(speedA, speedB);

                if (relativeSpeed > 1.2) {
                    playBoingSound(relativeSpeed);
                    lastSoundTime = now;
                }
            }
        }
    });

    // Control de interacción y lanzamiento con el puntero/ratón
    const mouse = Mouse.create(document.body);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.22,
            render: { visible: false }
        }
    });

    Composite.add(engine.world, mouseConstraint);

    runner = Runner.create();
    Runner.run(runner, engine);

    // Loop de renderizado a 60 FPS
    function updateLoop() {
        if (!isGravityActive) return;

        for (let i = 0; i < physicsElements.length; i++) {
            const { el, body, rect } = physicsElements[i];
            const { x, y } = body.position;
            const angle = body.angle;

            el.style.transform = `translate3d(${x - rect.width / 2}px, ${y - rect.height / 2}px, 0px) rotate(${angle}rad)`;
        }

        requestAnimationFrame(updateLoop);
    }

    requestAnimationFrame(updateLoop);
}

/* ==========================================================================
   5. RESTAURACIÓN DE LA GRAVEDAD Y POSICIÓN ORIGINAL
   ========================================================================== */
function stopPhysics() {
    const { Runner, Composite } = Matter;

    if (runner) Runner.stop(runner);
    if (engine) Composite.clear(engine.world, false);

    physicsElements.forEach(({ el, rect }) => {
        // Transición suave de retorno a la posición original exacta
        el.style.transition = 'transform 0.7s cubic-bezier(0.2, 0.9, 0.3, 1.2)';
        el.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0px) rotate(0rad)`;

        setTimeout(() => {
            const orig = el.dataset.origStyle;
            if (orig) {
                el.setAttribute('style', orig);
            } else {
                el.removeAttribute('style');
            }
            delete el.dataset.origStyle;
        }, 700);
    });

    physicsElements = [];
}