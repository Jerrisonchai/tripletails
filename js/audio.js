// audio.js — TripleTails v1.0
// Procedural Web Audio API. Zero audio files.
const Audio = {
  ctx: null,
  muted: false,

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.muted = Storage.getSettings().muted;
    } catch (e) { /* Web Audio not available */ }
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  toggle() {
    this.muted = !this.muted;
    Storage.setSettings({ muted: this.muted });
    return this.muted;
  },

  _play(oscType, freqStart, freqEnd, duration, gainVal = 0.15, noise = false) {
    if (this.muted || !this.ctx) return;
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.connect(this.ctx.destination);
    gain.gain.setValueAtTime(gainVal, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    if (noise) {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(gain);
      src.start(t);
      return;
    }

    const osc = this.ctx.createOscillator();
    osc.type = oscType;
    osc.frequency.setValueAtTime(freqStart, t);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
    }
    osc.connect(gain);
    osc.start(t);
    osc.stop(t + duration);
  },

  pick()       { this._play('sine', 800, 500, 0.08, 0.12); },
  land()       { this._play('sine', 200, 100, 0.1, 0.1); this._play('sine', 400, 300, 0.06, 0.05, true); },
  match()      {
    this._play('sine', 523, 523, 0.1, 0.12);  // C5
    setTimeout(() => this._play('sine', 659, 659, 0.1, 0.12), 80);  // E5
    setTimeout(() => this._play('sine', 784, 784, 0.2, 0.12), 160); // G5
  },
  gameOver()   { this._play('sawtooth', 400, 200, 0.5, 0.15); },
  easyWin()    {
    const notes = [523, 659, 784, 1047]; // C-E-G-C
    notes.forEach((f, i) => setTimeout(() => this._play('sine', f, f, 0.3, 0.12), i * 200));
  },
  hardWin()    {
    // Triumphant fanfare
    const notes = [523, 659, 784, 659, 784, 1047, 784, 1047];
    notes.forEach((f, i) => setTimeout(() => this._play('triangle', f, f, 0.4, 0.15), i * 300));
  },
  booster()    { this._play('sine', 800, 1200, 0.2, 0.1, true); },
  purchase()   { this._play('square', 1200, 800, 0.15, 0.1); },
  error()      { this._play('sawtooth', 200, 200, 0.2, 0.12); },
  click()      { this._play('square', 800, 800, 0.03, 0.06); }
};
