// tiles.js — TripleTails v1.0
// Tile data model, critter type definitions, colors
const Tiles = {
  // 10 Kenney animal types (CC0: kenney.nl/assets/animal-pack)
  TYPES: [
    'elephant', 'giraffe', 'hippo', 'monkey', 'panda',
    'parrot', 'penguin', 'pig', 'rabbit', 'snake'
  ],

  // CSS class names
  CRITTER_CLASSES: {
    elephant: 'critter-elephant', giraffe: 'critter-giraffe',
    hippo: 'critter-hippo', monkey: 'critter-monkey',
    panda: 'critter-panda', parrot: 'critter-parrot',
    penguin: 'critter-penguin', pig: 'critter-pig',
    rabbit: 'critter-rabbit', snake: 'critter-snake'
  },

  // Emoji shorthand
  EMOJI: {
    elephant: '🐘', giraffe: '🦒', hippo: '🦛', monkey: '🐵', panda: '🐼',
    parrot: '🦜', penguin: '🐧', pig: '🐷', rabbit: '🐰', snake: '🐍'
  },

  getClass(type) { return this.CRITTER_CLASSES[type] || 'critter-elephant'; },
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
