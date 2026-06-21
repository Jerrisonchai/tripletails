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
    if (name === 'shop') Shop.refresh();
    if (name === 'collections') this.renderCollections();
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

    // Show admin badge if active
    const gear = document.getElementById('admin-gear');
    if (gear && Storage.isAdmin()) gear.classList.add('admin-active');

    // Easy status
    const easyDone = progress.easyCompleted && progress.lastPlayDate === todayDay;
    const isAdmin = Storage.isAdmin();
    document.getElementById('easy-status').textContent = easyDone && !isAdmin
      ? '✓ Completed! +50🪙' : (easyDone ? '✓ (Admin bypass)' : 'Not played');
    const btnEasy = document.getElementById('btn-easy');
    if (easyDone && !isAdmin) {
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
    let hardStatus = hardDone && !isAdmin ? '🏆 COMPLETED! +200🪙' : (hardDone ? '✓ (Admin bypass)' : `⏳ ${attempts} attempts today`);
    if (progress.bestRemaining > 0) {
      hardStatus += ` | 🎯 Best: ${progress.bestRemaining} tiles left`;
    }
    document.getElementById('hard-status').textContent = hardStatus;
    const btnHard = document.getElementById('btn-hard');
    if (hardDone && !isAdmin) {
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
  async showGame(difficulty) {
    // Initialize board
    Board.init(document.getElementById('board-container'));
    Matching.init();

    // Generate board (may load from daily.json)
    await Generator.generate(difficulty);
    Board.render();
    Matching.init();
    UI.updateTileCounter();
    UI.updateBoosterBar();

    document.getElementById('game-title').textContent = difficulty === 'easy' ? '🐣 Easy' : '🔥 Extreme Hard (7 layers)';
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
    ['shuffle', 'undo', 'eject', 'peek', 'autoMatch'].forEach(type => {
      const btn = document.getElementById(`btn-${type === 'autoMatch' ? 'automatch' : type}`);
      if (!btn) return;
      const countEl = btn.querySelector('.booster-count');
      if (countEl) countEl.textContent = inv[type] || 0;
      if (inv[type] > 0) btn.classList.remove('booster-btn--empty');
      else btn.classList.add('booster-btn--empty');
    });
  },

  updateCoins() {
    document.getElementById('coin-balance').textContent = Storage.getCoins();
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
      <p>Matches made: <b>${App.matchCount}</b></p>
      <p>Time: <b>${UI._formatTime(App.getElapsedTime())}</b></p>
      <p>Attempts today: <b>${attempts}</b></p>
      ${progress.bestRemaining ? `<p>Best: <b>${progress.bestRemaining}</b> tiles left</p>` : ''}
    `;

    document.getElementById('overlay-gameover').style.display = 'flex';
    document.querySelector('.bar-container').classList.add('gameover-shake');
    setTimeout(() => document.querySelector('.bar-container').classList.remove('gameover-shake'), 500);
  },

  showWin() {
    Input.disable();
    App._stopTimer();
    const progress = Storage.getProgress();
    const difficulty = App.currentDifficulty;
    const elapsed = App.getElapsedTime();

    // Stop timer
    const timerEl = document.getElementById('game-timer');
    if (timerEl) timerEl.textContent = `⏱ ${UI._formatTime(elapsed)}`;

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
<p>Difficulty: <b>${difficulty === 'easy' ? 'Easy' : 'EXTREME HARD (7 layers)'}</b></p>
      <p>Matches: <b>${App.matchCount}</b> | Time: <b>${UI._formatTime(elapsed)}</b></p>
      <p>Coins earned: <b>${difficulty === 'easy' ? '+50' : '+200'} 🪙</b></p>
      ${!progress.firstHardComplete && difficulty === 'hard' ? '<p>🎉 First completion bonus: <b>+500 🪙</b></p>' : ''}
    `;

    document.getElementById('overlay-win').style.display = 'flex';
  },

  _formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
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
    this.renderLeaderboard();
  },

  renderCollections() {
    const container = document.getElementById('collections-content');
    if (!container) return;
    const active = Collections.getActive();
    const coins = Storage.getCoins();

    let html = '';
    for (const [key, col] of Object.entries(Collections.COLLECTIONS)) {
      const isActive = key === active;
      const isUnlocked = col.unlocked;
      const canBuy = !isUnlocked && coins >= col.price;

      html += '<div class="collection-card ' + (isActive ? 'collection-card--active' : '') + '">';
      html += '<div class="collection-card-header"><span class="collection-card-name">' + col.name + '</span>';
      html += '<span class="collection-card-rarity ' + col.rarity.toLowerCase() + '">' + col.rarity + '</span></div>';
      html += '<p class="collection-card-desc">' + col.description + '</p>';
      html += '<div class="collection-preview">';
      Tiles.TYPES.forEach(t => {
        html += '<div class="collection-tile ' + Tiles.getClass(t) + '" style="background-size:70% auto;background-position:center 48%;width:36px;height:36px;border-radius:8px;display:inline-block;margin:3px;box-shadow:0 1px 3px rgba(0,0,0,0.3);position:relative;"></div>';
      });
      html += '</div>';
      html += '<div class="collection-card-actions">';
      if (isActive) {
        html += '<span class="collection-badge active">✅ Equipped</span>';
      } else if (isUnlocked) {
        html += '<button class="btn btn-play btn-sm" onclick="Collections.setActive(\'' + key + '\');UI.renderCollections()">👗 Equip</button>';
      } else {
        html += '<span class="collection-badge price">🪙 ' + col.price + '</span> ';
        if (canBuy) {
          html += '<button class="btn btn-play btn-sm" onclick="if(Collections.purchase(\'' + key + '\').success){UI.renderCollections();UI.updateCoins();Shop.refresh()}">🛒 Buy</button>';
        } else {
          html += '<button class="btn btn-play btn-sm btn--disabled" disabled>Need ' + (col.price - coins) + ' 🪙</button>';
        }
      }
      html += '</div></div>';
    }
    container.innerHTML = html;
  },

  renderLeaderboard(filter) {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;
    const progress = Storage.getProgress();
    const rankings = Leaderboard.generateRankings(progress.hardCompleted, 0);
    document.getElementById('lb-day').textContent = App._gameDay();
    let filtered = rankings;
    if (filter && filter !== 'all') filtered = rankings.filter(r => r.group === filter || r.isPlayer);
    document.querySelectorAll('.lb-tab').forEach(tab => {
      tab.classList.toggle('lb-tab--active', tab.dataset.filter === (filter || 'all'));
      tab.onclick = () => this.renderLeaderboard(tab.dataset.filter);
    });
    if (filtered.length === 0) { container.innerHTML = '<div class="placeholder-text">No entries for this group yet</div>'; return; }
    const stub = document.getElementById('lb-player-stub');
    if (stub) stub.style.display = filtered.some(r => r.isPlayer) ? 'none' : 'flex';
    const am = { fox:'🦊',owl:'🦉',deer:'🦌',bear:'🐻',wolf:'🐺',cat:'🐱',dog:'🐶',bird:'🐦',frog:'🐸',mouse:'🐭',duck:'🦆',turtle:'🐢',hamster:'🐹',koala:'🐨',otter:'🦦',badger:'🦡',raccoon:'🦝',squirrel:'🐿',hedgehog:'🦔',bat:'🦇' };
    const medals = ['🥇','🥈','🥉'];
    let html = '';
    filtered.forEach(entry => {
      const r = rankings.indexOf(entry);
      const rd = r < 3 ? medals[r] : '#' + (r + 1);
      html += '<div class="lb-row' + (entry.isPlayer ? ' lb-row--player' : '') + '">';
      html += '<span class="lb-rank' + (r < 3 ? ' lb-rank--medal' : '') + '">' + rd + '</span>';
      html += '<span class="lb-animal">' + (am[entry.animal] || '🐾') + '</span>';
      html += '<span class="lb-name">' + entry.name + (entry.isPlayer ? ' <small>👈</small>' : '') + '</span>';
      html += '<span class="lb-group">' + (Leaderboard.GROUP_ICONS[entry.group] || '') + '</span>';
      html += '<span class="lb-time">' + Leaderboard.formatTime(entry.time) + '</span>';
      html += '</div>';
    });
    container.innerHTML = html;
  },

};
