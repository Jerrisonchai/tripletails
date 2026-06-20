// ui.js — TripleTails v1.0
// Screen manager, UI updates, overlays, info page content
const UI = {
  currentScreen: 'home',

  init() {
    this._bindNavButtons();
    this._bindInfoTabs();
    this._loadInfoContent();
    this.updateHome();
  },

  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('screen--active'));
    const screen = document.getElementById(`screen-${name}`);
    if (screen) screen.classList.add('screen--active');
    this.currentScreen = name;

    // Update nav active state
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('nav-btn--active', b.dataset.screen === name);
    });

    if (name === 'home') this.updateHome();
    if (name === 'leaderboard') this._renderLeaderboardPlaceholder();
  },

  _bindNavButtons() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showScreen(btn.dataset.screen);
      });
    });
  },

  _bindInfoTabs() {
    document.querySelectorAll('.info-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.info-tab').forEach(t => t.classList.remove('info-tab--active'));
        tab.classList.add('info-tab--active');
        this._loadInfoContent(tab.dataset.tab);
      });
    });
  },

  _loadInfoContent(tab = 'story') {
    const container = document.getElementById('info-content');
    if (!container) return;
    container.innerHTML = INFO_CONTENT[tab] || INFO_CONTENT.story;
  },

  // ── Home Screen ──
  updateHome() {
    const progress = Storage.getProgress();
    const coins = Storage.getCoins();
    const day = App._gameDay();
    const todayDay = progress.day || day;

    document.getElementById('streak-day').textContent = todayDay;
    document.getElementById('coin-balance').textContent = coins;
    document.getElementById('lb-day').textContent = todayDay;

    // Easy status
    const easyDone = progress.easyCompleted && progress.lastPlayDate === todayDay;
    document.getElementById('easy-status').textContent = easyDone
      ? '✓ Completed! +50🪙' : 'Not played';
    const btnEasy = document.getElementById('btn-easy');
    if (easyDone) {
      btnEasy.textContent = '✓ DONE';
      btnEasy.style.opacity = '0.5';
      btnEasy.disabled = true;
    } else {
      btnEasy.textContent = '▶ PLAY';
      btnEasy.style.opacity = '1';
      btnEasy.disabled = false;
    }

    // Hard status
    const hardDone = progress.hardCompleted && progress.lastPlayDate === todayDay;
    const attempts = (progress.lastPlayDate === todayDay) ? progress.attempts : 0;
    let hardStatus = hardDone ? '🏆 COMPLETED! +200🪙' : `⏳ ${attempts} attempts today`;
    if (progress.bestRemaining > 0) {
      hardStatus += ` | 🎯 Best: ${progress.bestRemaining} tiles left`;
    }
    document.getElementById('hard-status').textContent = hardStatus;
    const btnHard = document.getElementById('btn-hard');
    if (hardDone) {
      btnHard.textContent = '🏆 DONE';
      btnHard.style.opacity = '0.5';
      btnHard.disabled = true;
    } else {
      btnHard.textContent = '▶ PLAY';
      btnHard.style.opacity = '1';
      btnHard.disabled = false;
    }
  },

  // ── Game Screen ──
  showGame(difficulty) {
    // Initialize board
    Board.init(document.getElementById('board-container'));
    Matching.init();

    // Set game state
    Generator.generate(difficulty);
    Board.render();
    Matching.init();
    UI.updateTileCounter();
    UI.updateBoosterBar();

    document.getElementById('game-title').textContent = difficulty === 'easy' ? '🐣 Easy' : '🔥 Extreme Hard';
    this.showScreen('game');
    Input.enable();
  },

  updateTileCounter() {
    const remaining = Board.remainingCount();
    const total = Board.totalCount();
    document.getElementById('tile-counter').textContent = `${remaining}/${total}`;
  },

  updateBoosterBar() {
    const inv = Storage.getInventory();
    ['shuffle', 'undo', 'eject'].forEach(type => {
      const btn = document.getElementById(`btn-${type}`);
      const count = document.getElementById(`btn-${type}`).querySelector('.booster-count');
      if (count) count.textContent = inv[type] || 0;
      if (inv[type] > 0) btn.classList.remove('booster-btn--empty');
      else btn.classList.add('booster-btn--empty');
    });
  },

  // ── Overlays ──
  showGameOver() {
    Input.disable();
    Audio.gameOver();
    const progress = Storage.getProgress();
    const attempts = (progress.attempts || 0) + 1;
    progress.attempts = attempts;
    progress.lastPlayDate = App._gameDay();
    const remaining = Board.remainingCount();
    if (remaining > 0 && remaining < (progress.bestRemaining || Infinity)) {
      progress.bestRemaining = remaining;
    }
    Storage.setProgress(progress);

    document.getElementById('gameover-stats').innerHTML = `
      <p>Tiles remaining: <b>${remaining}</b></p>
      <p>Attempts today: <b>${attempts}</b></p>
      ${progress.bestRemaining ? `<p>Best: <b>${progress.bestRemaining}</b> tiles left</p>` : ''}
    `;

    document.getElementById('overlay-gameover').style.display = 'flex';
    document.querySelector('.bar-container').classList.add('gameover-shake');
    setTimeout(() => document.querySelector('.bar-container').classList.remove('gameover-shake'), 500);
  },

  showWin() {
    Input.disable();
    const progress = Storage.getProgress();
    const difficulty = App.currentDifficulty;

    if (difficulty === 'easy') {
      Audio.easyWin();
      progress.easyCompleted = true;
      Storage.addCoins(50);
    } else {
      Audio.hardWin();
      progress.hardCompleted = true;
      progress.attempts = (progress.attempts || 0) + 1;
      Storage.addCoins(200);
      if (!progress.firstHardComplete) {
        progress.firstHardComplete = true;
        Storage.addCoins(500);
      }
    }

    progress.lastPlayDate = App._gameDay();
    Storage.setProgress(progress);

    const title = difficulty === 'easy' ? '✨ Nice Work!' : '🌟 YOU DID IT!';
    document.getElementById('win-title').textContent = title;
    document.getElementById('win-stats').innerHTML = `
      <p>Difficulty: <b>${difficulty === 'easy' ? 'Easy' : 'EXTREME HARD'}</b></p>
      <p>Coins earned: <b>${difficulty === 'easy' ? '+50' : '+200'} 🪙</b></p>
      ${!progress.firstHardComplete && difficulty === 'hard' ? '<p>🎉 First completion bonus: <b>+500 🪙</b></p>' : ''}
    `;

    document.getElementById('overlay-win').style.display = 'flex';
  },

  leaveGame() {
    document.getElementById('overlay-gameover').style.display = 'none';
    document.getElementById('overlay-win').style.display = 'none';
    this.updateHome();
    this.showScreen('home');
    Board.container.innerHTML = '';
    Board.tiles = [];
    Board.tileElements = {};
    Matching.bar = [];
  },

  retryGame() {
    document.getElementById('overlay-gameover').style.display = 'none';
    // Re-generate same difficulty
    Matching.init();
    Generator.generate(App.currentDifficulty);
    Board.render();
    UI.updateTileCounter();
    UI.updateBoosterBar();
    Input.enable();
  },

  _renderLeaderboardPlaceholder() {
    const el = document.getElementById('leaderboard-list');
    if (el) el.innerHTML = '<div class="placeholder-text">🏆 Leaderboard<br><small>Coming in Phase 7</small></div>';
  }
};
