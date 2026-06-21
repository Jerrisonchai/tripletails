// generator.js — TripleTails v1.1
// Daily board generator with solver verification.
// Phase 3: Guaranteed solvability via backtracking solver.
const Generator = {
  // Seeded random (simple LCG) for deterministic daily boards
  _seed: 0,
  _seedRandom() {
    this._seed = (this._seed * 16807 + 0) % 2147483647;
    return (this._seed - 1) / 2147483646;
  },

  // Override Math.random for deterministic generation
  _patchRandom() {
    const self = this;
    Math.random = function() {
      self._seed = (self._seed * 16807 + 0) % 2147483647;
      return (self._seed - 1) / 2147483646;
    };
  },

  setDailySeed() {
    const day = App._gameDay();
    this._seed = (day * 2654435761 + 20260620) % 2147483647;
    this._patchRandom();
  },

  // Main generate: guaranteed solvable
  generate(difficulty) {
    this.setDailySeed();
    const config = Board.LAYER_CONFIGS[difficulty];
    console.log(`[Generator] Generating ${difficulty} board (${config.totalLayers} layers, target ${config.totalTileTarget} tiles, ${config.typeCount} types)`);

    const maxRetries = difficulty === 'easy' ? 50 : 200;
    const solverTimeout = difficulty === 'easy' ? 5000 : 45000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Reset seed for consistent retries (same seed = same board)
      this.setDailySeed();
      // Advance seed by attempt to get different boards
      for (let i = 0; i < attempt * 100; i++) this._seedRandom();

      // Generate candidate board
      let totalTiles = config.totalTileTarget;
      const remainder = totalTiles % 3;
      if (remainder !== 0) totalTiles += (3 - remainder);

      const pool = Tiles.generatePool(totalTiles, config.typeCount);
      Board.generate(difficulty, pool);
      const tiles = Board.tiles;

      console.log(`[Generator] Attempt ${attempt}: ${tiles.length} tiles, verifying...`);

      // Verify solvability
      const solution = Solver.solve(tiles, solverTimeout);
      if (solution) {
        console.log(`[Generator] SOLVABLE on attempt ${attempt}! (${solution.length} moves)`);
        Board._solution = solution;
        return tiles;
      }

      console.log(`[Generator] Attempt ${attempt}: unsolvable, retrying...`);
    }

    // Fallback: use last generated board even if unsolvable (shouldn't happen)
    console.warn(`[Generator] WARNING: Could not generate solvable board after ${maxRetries} attempts!`);
    return Board.tiles;
  },

  // Pre-generate daily boards (used by build script)
  preGenerateDaily(difficulty, daySeed, maxRetries = 100) {
    // Override seed with specific day
    this._seed = (daySeed * 2654435761 + 20260620) % 2147483647;
    this._patchRandom();

    const config = Board.LAYER_CONFIGS[difficulty];
    const solverTimeout = difficulty === 'easy' ? 10000 : 60000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      this._seed = (daySeed * 2654435761 + 20260620 + attempt * 999983) % 2147483647;
      this._patchRandom();

      let totalTiles = config.totalTileTarget;
      const remainder = totalTiles % 3;
      if (remainder !== 0) totalTiles += (3 - remainder);

      const pool = Tiles.generatePool(totalTiles, config.typeCount);
      Board.generate(difficulty, pool);
      const tiles = Board.tiles;

      const solution = Solver.solve(tiles, solverTimeout);
      if (solution) {
        return { tiles, solution, attempt };
      }
    }
    return null;
  }
};
