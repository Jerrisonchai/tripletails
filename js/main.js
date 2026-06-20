// main.js — TripleTails v1.0
// Entry point, init sequence, admin mode, app-level state
const App = {
  currentDifficulty: 'easy',
  adminTapCount: 0,
  adminTapTimer: null,

  init() {
    Audio.init();
    Storage.getProgress(); // Ensure defaults exist
    this._setupDailyReset();
    UI.init();
    Generator.setDailySeed();
    this._setupAdminGear();
    console.log('🦊 TripleTails v1.0 initialized');
    console.log(`   Day ${this._gameDay()}, Seed: ${Generator._seed}`);
  },

  // ── Daily Helpers ──
  _gameDay() {
    const MS_8AM = 8 * 3600 * 1000;
    return Math.floor((Date.now() - MS_8AM) / 86400000);
  },

  _setupDailyReset() {
    const progress = Storage.getProgress();
    const today = this._gameDay();
    if (progress.day !== today) {
      // Daily reset
      progress.day = today;
      progress.easyCompleted = false;
      progress.hardCompleted = false;
      progress.attempts = 0;
      progress.bestRemaining = 0;
      progress.lastPlayDate = today;
      // Reset daily free boosters
      const inv = Storage.getInventory();
      inv.shuffle = 1;
      inv.undo = 1;
      inv.eject = 1;
      Storage.setInventory(inv);
      Storage.setProgress(progress);
    }
  },

  // ── Game Actions ──
  startGame(difficulty) {
    Audio.resume();
    this.currentDifficulty = difficulty;
    
    // Ensure daily boosters
    const inv = Storage.getInventory();
    if (inv.shuffle < 1) inv.shuffle = 1;
    if (inv.undo < 1) inv.undo = 1;
    if (inv.eject < 1) inv.eject = 1;
    Storage.setInventory(inv);

    UI.showGame(difficulty);
  },

  leaveGame() {
    UI.leaveGame();
  },

  retryGame() {
    UI.retryGame();
  },

  useBooster(type) {
    Audio.resume();
    const inv = Storage.getInventory();
    if (inv[type] <= 0) {
      Audio.error();
      return;
    }

    const used = Storage.useBooster(type);
    if (!used) return;

    Audio.booster();
    switch (type) {
      case 'shuffle':
        Board.shuffle();
        break;
      case 'undo':
        Matching.undoLast();
        break;
      case 'eject':
        Matching.ejectThree();
        break;
    }

    UI.updateBoosterBar();
  },

  // ── Screen Navigation ──
  showScreen(name) {
    UI.showScreen(name);
  },

  // ── Admin ──
  _setupAdminGear() {
    const gear = document.getElementById('admin-gear');
    if (!gear) return;
    gear.addEventListener('click', () => this.adminTap());
  },

  adminTap() {
    this.adminTapCount++;
    if (this.adminTapCount >= 5) {
      this.adminTapCount = 0;
      Storage.setAdmin(true);

      // Top up testing resources
      const coins = Storage.getCoins();
      Storage.setCoins(coins + 999);

      const inv = Storage.getInventory();
      inv.shuffle = 99;
      inv.undo = 99;
      inv.eject = 99;
      Storage.setInventory(inv);

      // Update UI
      UI.updateCoins();
      UI.updateBoosterBar();

      // Show admin badge
      const gear = document.getElementById('admin-gear');
      if (gear) gear.classList.add('admin-active');

      alert('🔓 Admin mode ON — 999 coins, 99 boosters each');
      console.log('Admin mode ON');
    }
    clearTimeout(this.adminTapTimer);
    this.adminTapTimer = setTimeout(() => { this.adminTapCount = 0; }, 3000);
  }
};

// ── Info Page Content ──
const INFO_CONTENT = {
  story: `
    <h3>🦊 The Legend of TripleTails</h3>
    <p class="story-text"><em>Deep in the Enchanted Forest, every critter is born with a tail — and that tail is the source of all their magic.</em></p>
    <p class="story-text"><em>The cat's tail gives her grace. The bunny's tail brings him luck. The fox's tail holds her cleverness. Without their tails, the critters are lost, wandering the forest in a sleepy daze.</em></p>
    <p class="story-text"><em>One stormy night, a great wind swept through the Enchanted Forest. The critters' tails were scattered across the meadow, buried under piles of leaves, tangled in branches, and stacked haphazardly in messy piles.</em></p>
    <p class="story-text"><em>Now the critters sleep, waiting. They can only wake up when THREE of the same kind find each other — triple tails, triple magic, triple life.</em></p>
    <p class="story-text"><em>That's where YOU come in. Tap the critters. Match three identical friends. Watch their tails glow as they spring back to life and scamper off into the forest.</em></p>
    <p class="story-text"><em>Are you ready to restore the forest? 🌿</em></p>
  `,
  howto: `
    <h3>🎯 HOW TO WIN</h3>
    <p><strong>📋 THE BASICS</strong><br>• Tap any glowing critter to send it to the bar<br>• Match 3 of the SAME critter in the bar → they vanish!<br>• Clear ALL critters from ALL layers → YOU WIN!</p>
    <p><strong>⚠️ WATCH OUT</strong><br>• The bar only has 7 slots<br>• If 7 different critters fill the bar → GAME OVER<br>• Dim critters are blocked — tap the glowing ones!</p>
    <p><strong>🧠 STRATEGY TIPS</strong><br>• Plan ahead! Look at what's visible before tapping<br>• Try to keep 1–2 bar slots open for emergencies<br>• If you see 2 of the same critter, save them — don't send to bar unless the 3rd is reachable<br>• Use Shuffle when you're stuck<br>• Use Undo if you tap the wrong critter<br>• Use Eject to send 3 bar critters back to the board</p>
    <p><strong>🔥 EXTREME HARD SURVIVAL</strong><br>• Expect to fail. A lot. That's normal.<br>• Each attempt teaches you where critters are hidden<br>• The first 5 moves matter most<br>• Save boosters for deep runs</p>
  `,
  boosters: `
    <h3>⚡ BOOSTERS</h3>
    <p>Every game you get <strong>1 FREE</strong> of each:</p>
    <p>🔀 <strong>Shuffle</strong> — Randomize all remaining tiles<br>↩️ <strong>Undo</strong> — Send last tile back to the board<br>📤 <strong>Eject</strong> — Return 3 tiles from bar to board</p>
    <p><strong>🪙 EARNING COINS</strong><br>Easy complete → 50 🪙<br>Hard complete → 200 🪙<br>First Hard win → 500 🪙</p>
    <p><strong>🛒 SHOP</strong> (Coming Phase 5)<br>Buy booster packs with coins<br>Unlock themed tile collections</p>
  `,
  disclaimer: `
    <h3>📅 DAILY SCHEDULE</h3>
    <p>Reset time: 8:00 AM (Malaysia time)<br>Easy: 1 play per day<br>Hard: Unlimited attempts, 1 win counts<br>Board: Same for everyone each day</p>
    <h3>🌍 FEATURES</h3>
    <p>🏆 Leaderboard — 200 AI players<br>💬 Alliance Chat — 20 bots + you<br>🎨 Collections — Themed tile skins<br>🛒 Shop — Booster packs & skins</p>
    <h3 class="disclaimer-heading">⚠️ DISCLAIMER</h3>
    <p class="disclaimer-text">TripleTails is a single-player puzzle game. All leaderboard rankings include AI-generated bot players for entertainment. No personal data is collected, stored, or transmitted. All game progress is saved locally on your device. Clearing browser data will reset progress.</p>
    <p class="disclaimer-text">© 2026 TripleTails. Made with ❤️ in Malaysia. Version 1.0</p>
  `
};

// ── Boot ──
document.addEventListener('DOMContentLoaded', () => App.init());
