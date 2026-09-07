/**
 * BRIDGED LOOP CREATIVE DESIGN & WEB — CORE INTERACTIVE ENGINE
 * 60 FPS Motion Suite, HUD Telemetry, Web Audio Synthesizer, 3D Tilt & Terminal CLI
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================================================
  // 1. WEB AUDIO SYNTHESIZER (Micro-clicks & beeps without external audio files)
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
      } catch (e) {}
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
  // 2. TEXT SCRAMBLE DECODER EFFECT (Matrix Decryption Microinteraction)
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
          output += `<span class="scramble-char">${char}</span>`;
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

  const scrambleElements = document.querySelectorAll('.scramble-text, [data-scramble]');
  scrambleElements.forEach((el) => {
    const fx = new TextScramble(el);
    const targetText = el.getAttribute('data-scramble') || el.innerText.trim();
    setTimeout(() => {
      fx.setText(targetText);
    }, 250);

    el.addEventListener('mouseenter', () => {
      fx.setText(targetText);
    });
  });

  // ==========================================================================
  // 3. CYBERPUNK PERSPECTIVE GRID CANVAS BACKGROUND (60 FPS)
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
    const particleCount = 42;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.6,
        speedY: -(Math.random() * 0.45 + 0.1),
        speedX: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.65 + 0.2,
      });
    }

    function renderGrid() {
      ctx.clearRect(0, 0, width, height);

      const gridSize = 45;
      offset = (offset + 0.35) % gridSize;

      // Líneas de grilla sutiles
      ctx.strokeStyle = 'rgba(11, 38, 71, 0.35)';
      ctx.lineWidth = 1;

      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = offset; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Partículas creativas de energía (Coral Naranja)
      const particleRgb = '255, 127, 50';
      const particleShadow = '#ff7f32';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = `rgba(${particleRgb}, ${p.opacity})`;
        ctx.shadowColor = particleShadow;
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
  const tiltCards = document.querySelectorAll('.cyber-card:not(.project-card), .hud-hologram-frame, .team-card');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

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

      const submitBtn = document.getElementById('term-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = '[ PROCESANDO ESPECIFICACIONES... ]';
      }

      if (progressContainer) progressContainer.style.display = 'block';

      appendTerminalLog(`> INICIANDO CONEXIÓN SEGURA CON NODO CENTRAL...`, 'log-warn');
      appendTerminalLog(`> REGISTRANDO REQUERIMIENTOS: [${name} <${email}>]`, 'log-prefix');

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
            appendTerminalLog(`> [200 OK] ESPECIFICACIONES RECIBIDAS EXITOSAMENTE.`, 'log-success');
            appendTerminalLog(`> ASIGNADO AL EQUIPO DE INGENIERÍA Y PROPUESTAS TÉCNICAS.`, 'log-success');
            appendTerminalLog(`> ESTIMACIÓN Y COTIZACIÓN EN MENOS DE 24 HORAS HÁBILES.`, 'log-prefix');
            audioSynth.playConfirmBeep();

            if (submitBtn) {
              submitBtn.innerText = '[ REQUERIMIENTOS ENVIADOS ]';
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

  const latencyDisplay = document.querySelector('.hud-latency');
  if (latencyDisplay) {
    setInterval(() => {
      const ping = Math.floor(Math.random() * 6) + 12;
      latencyDisplay.textContent = `${ping}ms`;
    }, 3500);
  }

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
            setTimeout(() => {
              card.style.transition = 'opacity 0.25s ease';
              card.style.opacity = '1';
            }, 30);
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ==========================================================================
  // 8. GSAP & SCROLLTRIGGER ANIMATIONS + COUNTERS
  // ==========================================================================
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    gsap.utils.toArray('.reveal-stagger').forEach((section) => {
      const items = section.querySelectorAll('.cyber-card, .project-card, .stat-matrix-card, .team-card');
      if (items.length > 0) {
        gsap.fromTo(items, 
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 95%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        );
      }
    });

    window.addEventListener('load', () => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
    setTimeout(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 400);

    const counters = document.querySelectorAll('.counter-val');
    counters.forEach((counter) => {
      const target = parseFloat(counter.getAttribute('data-target') || counter.innerText);
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';
      const isDecimal = target % 1 !== 0;

      ScrollTrigger.create({
        trigger: counter,
        start: 'top 95%',
        once: true,
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
    document.querySelectorAll('.counter-val').forEach((counter) => {
      const target = counter.getAttribute('data-target');
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';
      if (target) counter.innerText = prefix + target + suffix;
    });
  }

  // ==========================================================================
  // 9. SHOWCASE MODULAR: CULTURA SEMILLAS CAROUSEL & HUD CONTROLS
  // ==========================================================================
  const csShowcase = document.getElementById('showcase-cultura-semillas') || document.querySelector('.showcase-modular-container')?.closest('.project-card, section, div, main');
  if (csShowcase) {
    const csSlides = csShowcase.querySelectorAll('.showcase-slide');
    const csTabs = csShowcase.querySelectorAll('.cs-tab-btn');
    const csPrevBtn = document.getElementById('cs-prev');
    const csNextBtn = document.getElementById('cs-next');
    const csCurrentNumDisplay = document.getElementById('cs-current-num');
    const csProgressBar = document.getElementById('cs-progress-bar');
    const csMonitorFrame = document.getElementById('cs-carousel');

    let csCurrentIndex = 0;
    const csTotalSlides = csSlides.length;
    let csTouchStartX = 0;
    let csTouchEndX = 0;

    const updateShowcase = (index) => {
      csCurrentIndex = (index + csTotalSlides) % csTotalSlides;

      csSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === csCurrentIndex);
      });

      csTabs.forEach((tab, i) => {
        const isActive = i === csCurrentIndex;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      if (csCurrentNumDisplay) {
        csCurrentNumDisplay.textContent = String(csCurrentIndex + 1).padStart(2, '0');
      }

      if (csProgressBar) {
        const percentage = ((csCurrentIndex + 1) / csTotalSlides) * 100;
        csProgressBar.style.width = `${percentage}%`;
      }
    };

    if (csPrevBtn) {
      csPrevBtn.addEventListener('click', () => {
        audioSynth.playKeyClick();
        updateShowcase(csCurrentIndex - 1);
      });
    }

    if (csNextBtn) {
      csNextBtn.addEventListener('click', () => {
        audioSynth.playKeyClick();
        updateShowcase(csCurrentIndex + 1);
      });
    }

    csTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        audioSynth.playKeyClick();
        const slideIdx = parseInt(tab.dataset.slide, 10);
        if (!isNaN(slideIdx)) {
          updateShowcase(slideIdx);
        }
      });
    });

    if (csMonitorFrame) {
      csMonitorFrame.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          audioSynth.playKeyClick();
          updateShowcase(csCurrentIndex - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          audioSynth.playKeyClick();
          updateShowcase(csCurrentIndex + 1);
        }
      });

      csMonitorFrame.addEventListener('touchstart', (e) => {
        csTouchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      csMonitorFrame.addEventListener('touchend', (e) => {
        csTouchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 40;
        if (csTouchEndX < csTouchStartX - swipeThreshold) {
          audioSynth.playKeyClick();
          updateShowcase(csCurrentIndex + 1);
        } else if (csTouchEndX > csTouchStartX + swipeThreshold) {
          audioSynth.playKeyClick();
          updateShowcase(csCurrentIndex - 1);
        }
      }, { passive: true });
    }
  }

  // ==========================================================================
  // 10. PUNTERO ANIMADO // RETÍCULA DE DISEÑO GRÁFICO (NARANJA CORAL)
  // ==========================================================================
  if (window.matchMedia('(pointer: fine)').matches) {
    const cursor = document.createElement('div');
    cursor.className = 'graphic-cross-cursor';
    cursor.innerHTML = `
      <div class="cursor-cross-h"></div>
      <div class="cursor-cross-v"></div>
      <div class="cursor-center-dot"></div>
      <div class="cursor-hud-ring"></div>
      <div class="cursor-crop-frame">
        <span class="cursor-crop-mark tl"></span>
        <span class="cursor-crop-mark tr"></span>
        <span class="cursor-crop-mark bl"></span>
        <span class="cursor-crop-mark br"></span>
      </div>
      <div class="cursor-ripple"></div>
    `;
    document.body.appendChild(cursor);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        cursor.classList.add('is-visible');
        isVisible = true;
      }
    });

    document.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-visible');
      isVisible = false;
    });

    document.addEventListener('mouseenter', () => {
      cursor.classList.add('is-visible');
      isVisible = true;
    });

    const renderCursor = () => {
      cursorX += (mouseX - cursorX) * 0.28;
      cursorY += (mouseY - cursorY) * 0.28;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    const interactiveSelector = 'a, button, input, textarea, select, .project-card, .cs-tab-btn, .hud-nav-btn, .filter-btn, .cyber-btn, .nav-item, .card-tilt, #gravity-toggle-btn, #whatsapp-float-btn';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelector)) {
        cursor.classList.add('is-hovering');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelector)) {
        cursor.classList.remove('is-hovering');
      }
    });

    const ripple = cursor.querySelector('.cursor-ripple');
    window.addEventListener('mousedown', () => {
      cursor.classList.add('is-clicking');
      if (ripple) {
        ripple.classList.remove('animate');
        void ripple.offsetWidth;
        ripple.classList.add('animate');
      }
    });

    window.addEventListener('mouseup', () => {
      cursor.classList.remove('is-clicking');
    });
  }

  // ==========================================================================
  // 11. IMAGE FALLBACK & ERROR HANDLING
  // ==========================================================================
  const slideImages = document.querySelectorAll('.slide-img');
  slideImages.forEach((img) => {
    const handleFallback = () => {
      img.parentElement?.classList.add('is-fallback');
    };
    img.addEventListener('error', handleFallback);
    if (img.complete && img.naturalHeight === 0) {
      handleFallback();
    }
  });

  // ==========================================================================
  // 12. FLOATING WHATSAPP BUTTON (Direct Line HUD: 3310716103)
  // ==========================================================================
  function createWhatsAppButton() {
    if (document.getElementById('whatsapp-float-btn')) return;

    const waBtn = document.createElement('a');
    waBtn.id = 'whatsapp-float-btn';
    waBtn.href = 'https://wa.me/523310716103';
    waBtn.target = '_blank';
    waBtn.rel = 'noopener noreferrer';
    waBtn.setAttribute('aria-label', 'Contactar por WhatsApp (+52 33 1071 6103)');
    waBtn.innerHTML = `
      <span class="wa-tooltip">WHATSAPP // 33 1071 6103</span>
      <svg class="wa-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    `;
    document.body.appendChild(waBtn);
  }

  createWhatsAppButton();
});

