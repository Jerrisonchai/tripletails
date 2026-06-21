// leaderboard.js — TripleTails v1.2
// Phase 7: 200 AI bot leaderboard, daily ranking
const Leaderboard = {
  _bots: null,
  _rankings: null,

  GROUP_ICONS: {
    pro: '🏅', medium: '🎯', lazy: '😴', mia: '👻', alliance: '💬',
  },
  GROUP_LABELS: {
    pro: 'Pro', medium: 'Medium', lazy: 'Lazy', mia: 'MIA', alliance: 'Alliance',
  },

  async init() {
    try {
      const resp = await fetch('data/bots.json');
      if (resp.ok) this._bots = await resp.json();
    } catch (e) {
      console.warn('[Leaderboard] Could not load bots.json:', e.message);
      this._bots = [];
    }
  },

  // Generate daily rankings (deterministic from date)
  generateRankings(playerCompleted, playerTime) {
    if (!this._bots || !this._bots.length) return [];

    const today = App._gameDay();
    // Seed PRNG from today's date — same bots play every day, same scores
    let seed = today * 2654435761 + 20260620;
    function rand() {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed - 1) / 2147483646;
    }

    const rankings = [];
    const leaderboardBots = this._bots.filter(b => b.group !== 'alliance');

    for (const bot of leaderboardBots) {
      if (bot.group === 'mia') {
        if (rand() > bot.completionChance) continue;
      }
      if (bot.group === 'lazy' && rand() > 0.85) continue;

      const time = Math.floor(bot.windowMin + rand() * (bot.windowMax - bot.windowMin));
      rankings.push({
        id: bot.id,
        name: bot.name,
        group: bot.group,
        animal: bot.animal,
        time,
        isPlayer: false,
      });
    }

    // Insert player at their actual rank (pure time competition, no boost)
    if (playerCompleted && playerTime > 0) {
      const playerEntry = {
        id: 0,
        name: 'YOU',
        group: 'player',
        animal: 'rabbit',
        time: playerTime,
        isPlayer: true,
      };
      // Find where player's time places them
      let insertAt = rankings.findIndex(r => r.time > playerTime);
      if (insertAt === -1) insertAt = rankings.length;
      rankings.splice(insertAt, 0, playerEntry);
    }

    this._rankings = rankings;
    return rankings;
  },

  // Format seconds to M:SS
  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  },

  // Get player medal/rank text
  getRankDisplay(index) {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  },
};
