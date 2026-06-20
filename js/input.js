// input.js — TripleTails v1.4
// Touch/click handling, blocked-tile filtering, tap detection
const Input = {
  enabled: true,

  onTileTap(tile, element) {
    console.log(`[Input] Tap: ${tile.id} | blocked=${tile.blocked} | removed=${tile.removed} | type=${tile.critterType} | layer=${tile.layer}`);

    if (!this.enabled) { console.log('[Input] → rejected: input disabled'); return; }
    if (tile.removed)  { console.log('[Input] → rejected: tile removed'); return; }
    if (tile.blocked)  { console.log('[Input] → rejected: tile BLOCKED'); return; }

    console.log(`[Input] → ACCEPTED, adding to bar`);
    Audio.pick();
    Matching.addToBar(tile);
  },

  disable() { this.enabled = false; },
  enable() { this.enabled = true; }
};
