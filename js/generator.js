// generator.js — TripleTails v1.0
// Daily board generator. Phase 1: simple pool-based generation.
// Phase 3 will add solver verification.
const Generator = {
  // Seeded random (simple LCG) for deterministic daily boards
  _seed: 0,
  _seedRandom() {
    this._seed = (this._seed * 16807 + 0) % 2147483647;
    return (this._seed - 1) / 2147483646;
  },

  setDailySeed() {
    // Deterministic seed from date
    const now = new Date();
    const day = App._gameDay();
    // Mix day with a salt so seeds change daily
    this._seed = (day * 2654435761 + 20260620) % 2147483647;
    // Seed Math.random too (best effort)
    const rng = this._seedRandom;
    Math.random = function() { return rng.call(Generator); };
  },

  // Generate a board for the given difficulty
  generate(difficulty) {
    this.setDailySeed();
    const config = Board.LAYER_CONFIGS[difficulty];
    // Calculate exact tile count (must be multiple of 3)
    let totalTiles = config.totalTileTarget;
    const remainder = totalTiles % 3;
    if (remainder !== 0) totalTiles += (3 - remainder);

    const pool = Tiles.generatePool(totalTiles, config.typeCount);
    Board.generate(difficulty, pool);
    return Board.tiles;
  }
};
