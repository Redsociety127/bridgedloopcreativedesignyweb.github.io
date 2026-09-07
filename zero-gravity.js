/**
 * Bridged Loop - Zero Gravity Physics Engine with Web Audio Effects
 * Powered by Matter.js & Web Audio API
 */

document.addEventListener('DOMContentLoaded', () => {
    createGravityButton();
});

let isGravityActive = false;
let engine, runner;
let physicsElements = [];
let audioCtx = null;

/* ==========================================================================
   SINTETIZADOR DE AUDIO (Web Audio API)
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
    } catch (e) {}
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
    } catch (e) {}
}

/* ==========================================================================
   CONTROL DE LA UI Y BOTÓN
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
        playActivationSound();
        startPhysics();
    } else {
        isGravityActive = false;
        if (btnText) btnText.innerText = 'ACTIVAR MODO GRAVEDAD ZERO';
        btn?.classList.remove('gravity-active');
        playActivationSound();
        stopPhysics();
    }
}

/* ==========================================================================
   MOTOR FÍSICO Y EVENTOS DE COLISIÓN
   ========================================================================== */
function startPhysics() {
    const { Engine, Bodies, Composite, Mouse, MouseConstraint, Runner, Events } = Matter;

    engine = Engine.create();
    engine.gravity.y = 0.05;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const wallThickness = 120;
    const ground = Bodies.rectangle(width / 2, height + wallThickness / 2, width * 2, wallThickness, { isStatic: true });
    const ceiling = Bodies.rectangle(width / 2, -wallThickness / 2, width * 2, wallThickness, { isStatic: true });
    const leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true });
    const rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true });

    Composite.add(engine.world, [ground, ceiling, leftWall, rightWall]);

    const targets = document.querySelectorAll(
        'main h1, main h2, main p, main a, main button, main .cyber-card, main .project-card, main .stat-matrix-card, section h1, section h2, section p, section a:not(#gravity-toggle-btn):not(#whatsapp-float-btn)'
    );

    physicsElements = [];

    targets.forEach((el) => {
        if (el.closest('#gravity-toggle-btn') || el.closest('#whatsapp-float-btn') || el.closest('.hud-navbar')) return;

        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        el.dataset.origStyle = el.getAttribute('style') || '';

        const body = Bodies.rectangle(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            rect.width,
            rect.height,
            {
                restitution: 0.88,
                frictionAir: 0.02,
                friction: 0.08
            }
        );

        el.style.position = 'fixed';
        el.style.left = '0px';
        el.style.top = '0px';
        el.style.width = `${rect.width}px`;
        el.style.height = `${rect.height}px`;
        el.style.margin = '0';
        el.style.zIndex = '9000';
        el.style.userSelect = 'none';
        el.style.pointerEvents = 'auto';

        Composite.add(engine.world, body);
        physicsElements.push({ el, body, rect });
    });

    let lastSoundTime = 0;
    Events.on(engine, 'collisionStart', (event) => {
        const now = Date.now();
        if (now - lastSoundTime > 50) {
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

    const mouse = Mouse.create(document.body);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.25,
            render: { visible: false }
        }
    });

    Composite.add(engine.world, mouseConstraint);

    runner = Runner.create();
    Runner.run(runner, engine);

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

function stopPhysics() {
    const { Runner, Composite } = Matter;

    if (runner) Runner.stop(runner);
    if (engine) Composite.clear(engine.world, false);

    physicsElements.forEach(({ el }) => {
        el.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        el.style.transform = 'translate3d(0, 0, 0) rotate(0rad)';

        setTimeout(() => {
            const orig = el.dataset.origStyle;
            if (orig) {
                el.setAttribute('style', orig);
            } else {
                el.removeAttribute('style');
            }
            delete el.dataset.origStyle;
        }, 600);
    });

    physicsElements = [];
}