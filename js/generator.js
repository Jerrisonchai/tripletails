// generator.js — TripleTails v1.2
// Phase 3.1: Pre-generated daily boards from data/daily.json
// Falls back to generator+solver only if daily.json is unavailable
const Generator = {
  _seed: 0,
  _dailyCache: null,

  _seedRandom() {
    this._seed = (this._seed * 16807 + 0) % 2147483647;
    return (this._seed - 1) / 2147483646;
  },

  _patchRandom() {
    const self = this;
    Math.random = function() {
      self._seed = (self._seed * 16807 + 0) % 2147483647;
      return (self._seed - 1) / 2147483646;
    };
  },

  async loadDaily() {
    if (this._dailyCache) return this._dailyCache;
    try {
      const resp = await fetch('data/daily.json');
      if (resp.ok) {
        this._dailyCache = await resp.json();
        console.log('[Generator] Loaded daily.json with', Object.keys(this._dailyCache).length, 'days');
        return this._dailyCache;
      }
    } catch (e) {
      console.warn('[Generator] Could not load daily.json, will generate live:', e.message);
    }
    return null;
  },

  async generate(difficulty) {
    // Try pre-generated daily boards first
    const daily = await this.loadDaily();
    const todayStr = this._todayStr();

    if (daily && daily[todayStr]) {
      const board = daily[todayStr][difficulty];
      if (board && board.length > 0) {
        console.log(`[Generator] Using pre-generated ${difficulty} board for ${todayStr} (${board.length} tiles)`);
        Board.loadBoard(difficulty, board);
        return board;
      }
      console.warn(`[Generator] No pre-generated ${difficulty} board for ${todayStr}, falling back`);
    }

    // Fallback: live generation + solver
    console.log('[Generator] Live generation fallback...');
    return this._generateLive(difficulty);
  },

  _todayStr() {
    const d = new Date();
    // Use UTC+8 (MYT)
    const local = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    const yyyy = local.getUTCFullYear();
    const mm = String(local.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(local.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  },

  _generateLive(difficulty) {
    const config = Board.LAYER_CONFIGS[difficulty];
    const maxRetries = difficulty === 'easy' ? 50 : 200;
    const solverTimeout = difficulty === 'easy' ? 5000 : 30000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      // Seed from date + attempt
      this._seed = (App._gameDay() * 2654435761 + 20260620 + attempt * 999983) % 2147483647;
      this._patchRandom();

      let totalTiles = config.totalTileTarget;
      const remainder = totalTiles % 3;
      if (remainder !== 0) totalTiles += (3 - remainder);

      const pool = Tiles.generatePool(totalTiles, config.typeCount);
      Board.generate(difficulty, pool);
      const tiles = Board.tiles;

      const solution = Solver.solve(tiles, solverTimeout);
      if (solution) {
        console.log(`[Generator] Live ${difficulty} solvable on attempt ${attempt} (${tiles.length} tiles)`);
        Board._solution = solution;
        return tiles;
      }
      console.log(`[Generator] Live attempt ${attempt}: unsolvable`);
    }

    console.warn(`[Generator] WARNING: Could not generate solvable ${difficulty} board!`);
    return Board.tiles;
  }
};
