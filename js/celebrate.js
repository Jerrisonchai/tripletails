// celebrate.js — TripleTails v1.2
// Phase 9: Celebration effects, victory animations, particle systems
const Celebrate = {
  _canvas: null,
  _ctx: null,
  _particles: [],
  _confettiColors: ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff922b','#cc5de8','#fcc419','#20c997'],
  _animFrame: null,
  _active: false,

  init() {
    this._createCanvas();
  },

  _createCanvas() {
    const existing = document.getElementById('celebrate-canvas');
    if (existing) existing.remove();
    const canvas = document.createElement('canvas');
    canvas.id = 'celebrate-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
    document.body.appendChild(canvas);
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  },

  // ── Public API ──

  win(difficulty, isFirstHard) {
    Audio.celebrate();
    if (difficulty === 'hard') {
      if (isFirstHard) this._firstHardWin();
      else this._hardWin();
    } else {
      this._easyWin();
    }
  },

  collectionUnlock(collectionName) {
    this._sparkleBurst(800, 2000);
  },

  combo(count) {
    if (count >= 10) this._comboFlash('#ff0', 0.6);
    else if (count >= 5) this._comboFlash('#ff922b', 0.4);
    else if (count >= 3) this._comboFlash('#4d96ff', 0.3);
  },

  perfectClear() {
    this._confettiRain(150, 4000);
    this._sparkleBurst(1200, 3500);
  },

  // ── Internal Effects ──

  _easyWin() {
    this._confettiRain(60, 2500);
    this._sparkleBurst(500, 2000);
  },

  _hardWin() {
    this._confettiRain(100, 4000);
    this._sparkleBurst(800, 3000);
    // Second wave
    setTimeout(() => this._confettiRain(60, 2000), 1500);
  },

  _firstHardWin() {
    // Massive celebration
    this._confettiRain(150, 5000);
    this._sparkleBurst(1200, 4000);
    setTimeout(() => this._confettiRain(100, 3000), 1000);
    setTimeout(() => this._sparkleBurst(800, 2500), 2000);
    setTimeout(() => this._confettiRain(80, 2000), 3000);
    // Screen golden flash
    this._screenFlash('rgba(255,215,0,0.3)', 800);
  },

  _comboFlash(color, intensity) {
    this._screenFlash(color, 300);
    this._sparkleBurst(200, 1000);
  },

  _screenFlash(color, duration) {
    const flash = document.createElement('div');
    flash.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:${color};pointer-events:none;z-index:9997;opacity:0;transition:opacity 0.15s ease-out;`;
    document.body.appendChild(flash);
    requestAnimationFrame(() => { flash.style.opacity = '1'; });
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 200);
    }, duration);
  },

  // ── Confetti System ──
  _confettiRain(count, duration) {
    for (let i = 0; i < count; i++) {
      const particle = {
        x: Math.random() * this._canvas.width,
        y: -20 - Math.random() * 100,
        w: 6 + Math.random() * 10,
        h: 4 + Math.random() * 8,
        color: this._confettiColors[Math.floor(Math.random() * this._confettiColors.length)],
        vx: -2 + Math.random() * 4,
        vy: 3 + Math.random() * 5,
        rotation: Math.random() * 360,
        rotSpeed: -5 + Math.random() * 10,
        gravity: 0.08,
        life: 1.0,
        decay: 1 / (duration / 16),
        shape: Math.random() > 0.5 ? 'rect' : 'square',
      };
      // Stagger spawn
      setTimeout(() => this._particles.push(particle), Math.random() * duration);
    }
    this._startLoop();
    setTimeout(() => this._stopAfterTimeout(), duration + 3000);
  },

  // ── Sparkle System ──
  _sparkleBurst(radius, duration) {
    const cx = this._canvas.width / 2;
    const cy = this._canvas.height / 2;
    const count = 50;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 2 + Math.random() * 6;
      const size = 2 + Math.random() * 4;
      const particle = {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        color: this._confettiColors[Math.floor(Math.random() * this._confettiColors.length)],
        type: 'sparkle',
        life: 1.0,
        decay: 1 / (duration / 16),
        gravity: 0.03,
      };
      this._particles.push(particle);
    }
    this._startLoop();
  },

  // ── Animation Loop ──
  _startLoop() {
    if (this._animFrame) return;
    this._active = true;
    this._loop();
  },

  _loop() {
    if (!this._active) { this._animFrame = null; return; }
    this._animFrame = requestAnimationFrame(() => this._loop());

    const ctx = this._ctx;
    const w = this._canvas.width;
    const h = this._canvas.height;
    ctx.clearRect(0, 0, w, h);

    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.x += p.vx;
      p.vy += p.gravity || 0;
      p.y += p.vy;
      p.life -= p.decay || 0.005;
      p.rotation = (p.rotation || 0) + (p.rotSpeed || 0);

      if (p.life <= 0 || p.y > h + 50) {
        this._particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.translate(p.x, p.y);

      if (p.type === 'sparkle') {
        // Draw star/sparkle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        const s = p.size;
        for (let j = 0; j < 5; j++) {
          const a = (j * Math.PI * 2) / 5 - Math.PI / 2;
          const r2 = j % 2 === 0 ? s : s * 0.4;
          const sx = Math.cos(a) * r2;
          const sy = Math.sin(a) * r2;
          j === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }

      ctx.restore();
    }
  },

  _stopAfterTimeout() {
    // Don't stop if new particles were added
    if (this._particles.length === 0) {
      this._active = false;
      this._animFrame = null;
      if (this._ctx) {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
      }
    } else {
      // Check again later
      setTimeout(() => this._stopAfterTimeout(), 1000);
    }
  },
};
