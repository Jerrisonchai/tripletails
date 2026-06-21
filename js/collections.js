// collections.js — TripleTails v1.2
// Phase 6: 5 tile skin collections, purchase, equip
const Collections = {
  ACTIVE_KEY: 'tt_activeCollection',

  // Collection definitions
  COLLECTIONS: {
    forest: {
      name: '🌿 Forest Friends',
      rarity: 'Common',
      price: 0,
      description: 'Warm earth tones, the default critters',
      unlocked: true,
      filter: 'none',
      colors: null, // uses CSS defaults
    },
    ocean: {
      name: '🌊 Ocean Buddies',
      rarity: 'Uncommon',
      price: 500,
      description: 'Blue/aqua tones, sea creatures',
      unlocked: false,
      filter: 'hue-rotate(160deg) saturate(1.1) brightness(0.95)',
      colors: null,
    },
    desert: {
      name: '🏜️ Desert Crew',
      rarity: 'Uncommon',
      price: 500,
      description: 'Sandy/warm tones, desert animals',
      unlocked: false,
      filter: 'hue-rotate(25deg) saturate(1.3) brightness(1.05) sepia(0.3)',
      colors: null,
    },
    sky: {
      name: '☁️ Sky Squad',
      rarity: 'Uncommon',
      price: 500,
      description: 'Light blue/white tones, flying creatures',
      unlocked: false,
      filter: 'hue-rotate(190deg) saturate(0.9) brightness(1.15)',
      colors: null,
    },
    lunar: {
      name: '🌙 Lunar Lights',
      rarity: 'Rare',
      price: 1000,
      description: 'Dark purple/gold, cosmic + sparkle effects',
      unlocked: false,
      filter: 'hue-rotate(260deg) saturate(1.2) brightness(0.85)',
      colors: null,
    },
  },

  init() {
    // Load unlocked state from storage
    const unlocked = Storage.get('collectionsUnlocked') || { forest: true };
    for (const key of Object.keys(this.COLLECTIONS)) {
      if (unlocked[key]) this.COLLECTIONS[key].unlocked = true;
    }
    this._applyActive();
  },

  // ── Active Collection ──
  getActive() {
    return Storage.get(this.ACTIVE_KEY) || 'forest';
  },

  setActive(key) {
    if (!this.COLLECTIONS[key] || !this.COLLECTIONS[key].unlocked) return false;
    Storage.set(this.ACTIVE_KEY, key);
    this._applyActive();
    return true;
  },

  _applyActive() {
    const key = this.getActive();
    // Remove all collection classes
    const app = document.getElementById('app');
    if (!app) return;
    Object.keys(this.COLLECTIONS).forEach(k => app.classList.remove(`collection-${k}`));
    app.classList.add(`collection-${key}`);
  },

  // ── Purchase ──
  purchase(key) {
    const col = this.COLLECTIONS[key];
    if (!col || col.unlocked) return { success: false, reason: 'Already owned' };
    const coins = Storage.getCoins();
    if (coins < col.price) return { success: false, reason: `Need ${col.price - coins} more 🪙` };
    Storage.setCoins(coins - col.price);
    col.unlocked = true;
    // Persist
    const unlocked = Storage.get('collectionsUnlocked') || { forest: true };
    unlocked[key] = true;
    Storage.set('collectionsUnlocked', unlocked);
    Audio.purchase();
    Celebrate.collectionUnlock(col.name);
    return { success: true };
  },

  // ── Preview Grid ──
  getPreview(key) {
    const col = this.COLLECTIONS[key];
    if (!col) return [];
    return Tiles.TYPES.map(type => ({
      type,
      emoji: Tiles.EMOJI[type],
      cssClass: Tiles.getClass(type),
    }));
  },
};
