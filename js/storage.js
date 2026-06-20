// storage.js — TripleTails v1.0
// localStorage CRUD with tt_ namespace
const Storage = {
  PREFIX: 'tt_',

  _key(name) { return this.PREFIX + name; },

  get(key) {
    try {
      const raw = localStorage.getItem(this._key(key));
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },

  set(key, value) {
    try {
      localStorage.setItem(this._key(key), JSON.stringify(value));
    } catch (e) { /* storage full — silently fail */ }
  },

  remove(key) {
    localStorage.removeItem(this._key(key));
  },

  // ── Progress ──
  getProgress() {
    return this.get('progress') || {
      day: App._gameDay(),
      easyCompleted: false,
      hardCompleted: false,
      attempts: 0,
      bestRemaining: 0,
      streak: 0,
      lastPlayDate: 0,
      firstHardComplete: false
    };
  },

  setProgress(p) { this.set('progress', p); },

  // ── Coins ──
  getCoins() { return this.get('coins') || 0; },
  setCoins(n) { this.set('coins', Math.max(0, n)); },
  addCoins(n) { this.setCoins(this.getCoins() + n); },

  // ── Inventory (boosters) ──
  getInventory() {
    return this.get('inventory') || {
      shuffle: 0, undo: 0, eject: 0, peek: 0, autoMatch: 0
    };
  },
  setInventory(inv) { this.set('inventory', inv); },
  useBooster(type) {
    const inv = this.getInventory();
    if (inv[type] > 0) { inv[type]--; this.setInventory(inv); return true; }
    return false;
  },

  // ── Settings ──
  getSettings() {
    return this.get('settings') || { muted: false };
  },
  setSettings(s) { this.set('settings', s); },

  // ── Admin ──
  isAdmin() { return this.get('admin') === true; },
  setAdmin(v) { this.set('admin', v); }
};
