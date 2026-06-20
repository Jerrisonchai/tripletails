// tiles.js — TripleTails v1.0
// Tile data model, critter type definitions, colors
const Tiles = {
  // All 15 critter types
  TYPES: [
    'cat', 'dog', 'bunny', 'panda', 'fox',
    'frog', 'bear', 'owl', 'lion', 'monkey',
    'unicorn', 'penguin', 'hamster', 'koala', 'raccoon'
  ],

  // CSS class names
  CRITTER_CLASSES: {
    cat: 'critter-cat', dog: 'critter-dog', bunny: 'critter-bunny',
    panda: 'critter-panda', fox: 'critter-fox', frog: 'critter-frog',
    bear: 'critter-bear', owl: 'critter-owl', lion: 'critter-lion',
    monkey: 'critter-monkey', unicorn: 'critter-unicorn', penguin: 'critter-penguin',
    hamster: 'critter-hamster', koala: 'critter-koala', raccoon: 'critter-raccoon'
  },

  // Emoji shorthand for display (not used on tiles — CSS draws them)
  EMOJI: {
    cat: '🐱', dog: '🐶', bunny: '🐰', panda: '🐼', fox: '🦊',
    frog: '🐸', bear: '🐻', owl: '🦉', lion: '🦁', monkey: '🐵',
    unicorn: '🦄', penguin: '🐧', hamster: '🐹', koala: '🐨', raccoon: '🦝'
  },

  getClass(type) { return this.CRITTER_CLASSES[type] || 'critter-cat'; },
  getEmoji(type) { return this.EMOJI[type] || '🐱'; },

  // Generate a pool of tiles: N total, each type appears in multiples of 3
  generatePool(totalTiles, typeCount) {
    const types = this.TYPES.slice(0, typeCount);
    const pairsNeeded = totalTiles / 3;
    const pool = [];
    for (let i = 0; i < pairsNeeded; i++) {
      const type = types[i % types.length];
      pool.push(type, type, type);
    }
    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }
};
