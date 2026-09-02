/**
 * BRIDGED LOOP CREATIVE DESIGN & WEB — CORE INTERACTIVE ENGINE
 * 60 FPS Cyberpunk Motion Suite, HUD Telemetry, Web Audio Synthesizer & Terminal CLI
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================================================
  // 1. WEB AUDIO SYNTHESIZER (Cyberpunk micro-clicks & beeps without external assets)
  // ==========================================================================
  class CyberAudioSynth {
    constructor() {
      this.ctx = null;
      this.enabled = false;
      this.initOnFirstInteraction();
    }

    initOnFirstInteraction() {
      const enableAudio = () => {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            this.ctx = new AudioContext();
            this.enabled = true;
          }
        }
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('keydown', enableAudio);
      };
      document.addEventListener('click', enableAudio, { once: true });
      document.addEventListener('keydown', enableAudio, { once: true });
    }

    playKeyClick() {
      if (!this.ctx || !this.enabled) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800 + Math.random() * 400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
      } catch (e) {
        // Silently ignore if audio context locked
      }
    }

    playConfirmBeep() {
      if (!this.ctx || !this.enabled) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
      } catch (e) {}
    }
  }

  const audioSynth = new CyberAudioSynth();

  // ==========================================================================
  // 2. TEXT SCRAMBLE DECODER EFFECT (Cyberpunk Cipher / Matrix Decryption)
  // ==========================================================================
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#________0101';
      this.update = this.update.bind(this);
    }

    setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => (this.resolve = resolve));
      this.queue = [];

      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 20);
        const end = start + Math.floor(Math.random() * 20);
        this.queue.push({ from, to, start, end });
      }

      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }

    update() {
      let output = '';
      let complete = 0;

      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.randomChar();
            this.queue[i].char = char;
          }
          output += `<span class="scramble-char" style="color: var(--cyan-neon); text-shadow: 0 0 8px var(--cyan-neon);">${char}</span>`;
        } else {
          output += from;
        }
      }

      this.el.innerHTML = output;

      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }

    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
  }

  // Initialize auto text-scramble on elements with .scramble-text or data-scramble
  const scrambleElements = document.querySelectorAll('.scramble-text, [data-scramble]');
  scrambleElements.forEach((el) => {
    const fx = new TextScramble(el);
    const targetText = el.getAttribute('data-scramble') || el.innerText.trim();
    // Run initial decode
    setTimeout(() => {
      fx.setText(targetText);
    }, 250);

    // Also replay on hover for microinteraction
    el.addEventListener('mouseenter', () => {
      fx.setText(targetText);
    });
  });

  // ==========================================================================
  // 3. CYBERPUNK PERSPECTIVE GRID CANVAS BACKGROUND (60 FPS RAF)
  // ==========================================================================
  const canvas = document.getElementById('cyber-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    let offset = 0;
    const particles = [];
    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.5,
        speedY: -(Math.random() * 0.4 + 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }

    function renderGrid() {
      ctx.clearRect(0, 0, width, height);

      // Grid Config
      const gridSize = 45;
      offset = (offset + 0.35) % gridSize;

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(116, 139, 145, 0.08)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal moving lines (giving subtle motion)
      for (let y = offset; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw floating digital energy particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 6;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(renderGrid);
    }

    renderGrid();
  }

  // ==========================================================================
  // 4. 3D TILT EFFECT & RADIAL GLOW BORDER TRACKER
  // ==========================================================================
  const tiltCards = document.querySelectorAll('.cyber-card, .project-card, .hud-hologram-frame');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Set CSS variables for radial glow light tracker
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // 3D Tilt calculation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // ==========================================================================
  // 5. TERMINAL CLI INTERACTION & PROTOCOL SUBMISSION (`contacto.html`)
  // ==========================================================================
  const terminalForm = document.getElementById('terminal-form');
  const terminalLogs = document.getElementById('terminal-logs');
  const progressBar = document.getElementById('terminal-progress');
  const progressContainer = document.getElementById('progress-container');
  const progressText = document.getElementById('progress-percentage');
  const audioToggleBtn = document.getElementById('audio-toggle');

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      audioSynth.enabled = !audioSynth.enabled;
      if (audioSynth.enabled && !audioSynth.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioSynth.ctx = new AudioContext();
      }
      audioToggleBtn.classList.toggle('active', audioSynth.enabled);
      audioToggleBtn.textContent = audioSynth.enabled ? '[ AUDIO: ON ]' : '[ AUDIO: OFF ]';
      if (audioSynth.enabled) audioSynth.playConfirmBeep();
    });
  }

  // Type sound feedback on terminal inputs
  const terminalInputs = document.querySelectorAll('.terminal-input, .terminal-textarea, .terminal-select');
  terminalInputs.forEach((input) => {
    input.addEventListener('input', () => {
      audioSynth.playKeyClick();
    });
  });

  if (terminalForm) {
    terminalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      audioSynth.playConfirmBeep();

      const name = document.getElementById('term-name')?.value || 'ANÓNIMO';
      const email = document.getElementById('term-email')?.value || 'NO_MAIL';
      const type = document.getElementById('term-type')?.value || 'GENERAL';
      const message = document.getElementById('term-message')?.value || '';

      const submitBtn = document.getElementById('term-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = '[ ENCRIPTANDO PAQUETE... ]';
      }

      if (progressContainer) progressContainer.style.display = 'block';

      // Log start
      appendTerminalLog(`> INICIANDO HANDSHAKE CON SSL-CYBER...`, 'log-warn');
      appendTerminalLog(`> ENCRIPTANDO PAYLOAD DE ORIGEN: [${name} <${email}>]`, 'log-prefix');

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 8;
        if (progress > 100) progress = 100;

        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressText) progressText.innerText = `${progress}%`;
        audioSynth.playKeyClick();

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            appendTerminalLog(`> [200 OK] PROTOCOLO EJECUTADO EXITOSAMENTE.`, 'log-success');
            appendTerminalLog(`> MENSAJE ENCOLADO EN LA RED NEURONAL DE BRIDGED LOOP.`, 'log-success');
            appendTerminalLog(`> RESPUESTA ESTIMADA: < 24 HORAS ESTÁNDAR.`, 'log-prefix');
            audioSynth.playConfirmBeep();

            if (submitBtn) {
              submitBtn.innerText = '[ TRANSMISIÓN COMPLETADA ]';
              submitBtn.classList.add('cyber-btn-primary');
            }

            terminalForm.reset();
          }, 400);
        }
      }, 120);
    });
  }

  function appendTerminalLog(text, className = '') {
    if (!terminalLogs) return;
    const line = document.createElement('div');
    line.className = `log-line ${className}`;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    terminalLogs.appendChild(line);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }

  // ==========================================================================
  // 6. HUD TELEMETRY, NAVBAR SCROLL & METRICS
  // ==========================================================================
  const navbar = document.querySelector('.hud-navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // Dynamic Latency Jitter (simulating live telemetry)
  const latencyDisplay = document.querySelector('.hud-latency');
  if (latencyDisplay) {
    setInterval(() => {
      const ping = Math.floor(Math.random() * 6) + 12; // 12ms - 17ms
      latencyDisplay.textContent = `${ping}ms`;
    }, 3500);
  }

  // Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-active');
      audioSynth.playKeyClick();
    });
  }

  // ==========================================================================
  // 7. PORTFOLIO FILTERING SYSTEM (`portafolio.html`)
  // ==========================================================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterButtons.length > 0 && projectCards.length > 0) {
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        audioSynth.playKeyClick();

        const targetCategory = btn.getAttribute('data-filter');

        projectCards.forEach((card) => {
          const cardCategory = card.getAttribute('data-category');
          if (targetCategory === 'all' || cardCategory === targetCategory) {
            card.style.display = 'flex';
            card.style.opacity = '0';
            card.style.transform = 'translateY(15px)';
            setTimeout(() => {
              card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ==========================================================================
  // 8. GSAP & SCROLLTRIGGER ANIMATIONS + INCREMENTAL COUNTERS
  // ==========================================================================
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Stagger in elements with .reveal-stagger
    gsap.utils.toArray('.reveal-stagger').forEach((section) => {
      const items = section.querySelectorAll('.cyber-card, .project-card, .stat-matrix-card, .team-card');
      if (items.length > 0) {
        gsap.from(items, {
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out',
        });
      }
    });

    // Animate Number Counters
    const counters = document.querySelectorAll('.counter-val');
    counters.forEach((counter) => {
      const target = parseFloat(counter.getAttribute('data-target') || counter.innerText);
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';
      const isDecimal = target % 1 !== 0;

      ScrollTrigger.create({
        trigger: counter,
        start: 'top 90%',
        onEnter: () => {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: () => {
              counter.innerText = prefix + (isDecimal ? obj.val.toFixed(1) : Math.floor(obj.val)) + suffix;
            },
          });
        },
      });
    });
  } else {
    // Fallback if GSAP is blocked
    document.querySelectorAll('.counter-val').forEach((counter) => {
      const target = counter.getAttribute('data-target');
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';
      if (target) counter.innerText = prefix + target + suffix;
    });
  }
});
