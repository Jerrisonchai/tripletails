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
    // Seed PRNG from today's date
    let seed = today * 2654435761 + 20260620;
    function rand() {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed - 1) / 2147483646;
    }

    const rankings = [];
    const leaderboardBots = this._bots.filter(b => b.group !== 'alliance');

    for (const bot of leaderboardBots) {
      // Determine if bot completes today
      if (bot.group === 'mia') {
        if (rand() > bot.completionChance) continue; // didn't play
      }
      // Lazy bots have 85% chance to play
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

    // Sort by completion time
    rankings.sort((a, b) => a.time - b.time);

    // Apply player time with ranking boost
    if (playerCompleted && playerTime > 0) {
      const now = Date.now();
      // 8am MYT reference
      const msSince8am = now - today * 86400000 - 8 * 3600 * 1000;

      let playerRank;
      if (msSince8am < 1800000) { playerRank = Math.min(3, rankings.length); }      // Before 8:30am → top 3
      else if (msSince8am < 7200000) { playerRank = Math.min(10, rankings.length); }  // Before 10am → top 10
      else { playerRank = Math.min(20 + Math.floor(rand() * 30), rankings.length); }   // After → competitive

      rankings.splice(playerRank, 0, {
        id: 0,
        name: 'YOU',
        group: 'player',
        animal: 'rabbit',
        time: playerTime,
        isPlayer: true,
      });
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
