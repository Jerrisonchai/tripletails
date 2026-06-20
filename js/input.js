// input.js — TripleTails v1.0
// Touch/click handling, blocked-tile filtering, tap detection
const Input = {
  enabled: true,

  onTileTap(tile, element) {
    if (!this.enabled) return;
    if (tile.removed) return;
    if (tile.blocked) return;

    Audio.pick();
    Matching.addToBar(tile);
  },

  disable() { this.enabled = false; },
  enable() { this.enabled = true; }
};
