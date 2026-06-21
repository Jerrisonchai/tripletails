// shop.js — TripleTails v1.2
// Phase 5: Shop screen, booster packs, coin economy, purchase flow
const Shop = {
  // Booster pack pricing (unit, 3-pack, 5-pack, 10-pack)
  BOOSTER_PRICES: {
    shuffle:   { unit: 40,  pack3: 100, pack5: 150, pack10: 250 },
    undo:      { unit: 30,  pack3: 80,  pack5: 120, pack10: 200 },
    eject:     { unit: 50,  pack3: 120, pack5: 180, pack10: 300 },
    peek:      { unit: 25,  pack3: 60,  pack5: 90,  pack10: 150 },
    autoMatch: { unit: 80,  pack3: 200, pack5: 300, pack10: 500 },
  },

  BOOSTER_LABELS: {
    shuffle:   '🔀 Shuffle',
    undo:      '↩️ Undo',
    eject:     '📤 Eject',
    peek:      '🔍 Peek',
    autoMatch: '⚡ Auto-Match',
  },

  _pending: null, // { type, packSize, price }

  init() {
    this._setupTabs();
    this.renderBoosterPanel();
    this.renderCoinsPanel();
  },

  refresh() {
    document.getElementById('shop-coin-balance').textContent = Storage.getCoins();
    this.renderBoosterPanel();
    this.renderCoinsPanel();
    UI.updateCoins();
  },

  // ── Tab Switching ──
  _setupTabs() {
    const tabs = document.querySelectorAll('.shop-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('shop-tab--active'));
        tab.classList.add('shop-tab--active');
        const panelType = tab.dataset.tab;
        document.querySelectorAll('.shop-panel').forEach(p => p.classList.remove('shop-panel--active'));
        const panel = document.getElementById(`shop-content-${panelType}`);
        if (panel) panel.classList.add('shop-panel--active');
        if (panelType === 'booster') this.renderBoosterPanel();
        if (panelType === 'coins') this.renderCoinsPanel();
        if (panelType === 'collection') this.renderCollectionsTab();
      });
    });
    // Confirm dialog
    document.getElementById('confirm-yes').addEventListener('click', () => this._completePurchase());
    document.getElementById('confirm-no').addEventListener('click', () => this._cancelPurchase());
  },

  // ── Booster Panel ──
  renderBoosterPanel() {
    const container = document.getElementById('shop-content-booster');
    if (!container) return;
    const coins = Storage.getCoins();
    const inv = Storage.getInventory();

    let html = '<div class="shop-section-title">⚡ Booster Packs</div>';
    html += '<p class="shop-subtitle">Stock up for your hard runs</p>';

    for (const [type, prices] of Object.entries(this.BOOSTER_PRICES)) {
      const owned = inv[type] || 0;
      html += `<div class="shop-item">
        <div class="shop-item-header">
          <span class="shop-item-name">${this.BOOSTER_LABELS[type]}</span>
          <span class="shop-item-owned">Owned: ${owned}</span>
        </div>
        <div class="shop-packs">
          ${this._packBtn(type, 'unit', 1, prices.unit, coins)}
          ${this._packBtn(type, 'pack3', 3, prices.pack3, coins)}
          ${this._packBtn(type, 'pack5', 5, prices.pack5, coins)}
          ${this._packBtn(type, 'pack10', 10, prices.pack10, coins)}
        </div>
      </div>`;
    }

    container.innerHTML = html;
  },

  _packBtn(type, packSize, count, price, coins) {
    const canAfford = coins >= price;
    const cls = canAfford ? '' : 'shop-pack--locked';
    const label = count === 1 ? '1×' : count + '×';
    return `<button class="shop-pack ${cls}" onclick="Shop.selectPack('${type}','${packSize}',${price},${count})">
      <span class="shop-pack-size">${label}</span>
      <span class="shop-pack-price">🪙${price}</span>
    </button>`;
  },

  selectPack(type, packSize, price, count) {
    const coins = Storage.getCoins();
    if (coins < price) {
      Audio.error();
      return;
    }
    this._pending = { type, packSize, price, count };
    document.getElementById('confirm-icon').textContent = this.BOOSTER_LABELS[type].split(' ')[0];
    document.getElementById('confirm-title').textContent = `Buy ${this.BOOSTER_LABELS[type]}?`;
    document.getElementById('confirm-text').innerHTML = `
      <p>${count}× ${this.BOOSTER_LABELS[type].split(' ').slice(1).join(' ')}</p>
      <p class="confirm-price">🪙 ${price} coins</p>
      <p class="confirm-balance">Your balance: 🪙 ${coins} → 🪙 ${coins - price}</p>
    `;
    document.getElementById('overlay-confirm').style.display = 'flex';
  },

  _completePurchase() {
    if (!this._pending) return;
    const { type, price, count } = this._pending;
    const coins = Storage.getCoins();
    if (coins < price) {
      Audio.error();
      this._cancelPurchase();
      return;
    }
    Storage.setCoins(coins - price);
    const inv = Storage.getInventory();
    inv[type] = (inv[type] || 0) + count;
    Storage.setInventory(inv);
    Audio.purchase();
    this._pending = null;
    document.getElementById('overlay-confirm').style.display = 'none';
    this.refresh();
    UI.updateBoosterBar();
  },

  _cancelPurchase() {
    this._pending = null;
    document.getElementById('overlay-confirm').style.display = 'none';
  },

  // ── Coins Panel ──
  renderCoinsPanel() {
    const container = document.getElementById('shop-content-coins');
    if (!container) return;
    const coins = Storage.getCoins();

    let html = `<div class="shop-section-title">🪙 Coin Balance</div>`;
    html += `<div class="coin-big-display">🪙 <span>${coins}</span></div>`;
    html += `<div class="shop-section-title" style="margin-top:16px">📋 How to Earn</div>`;
    html += `<div class="shop-earn-list">
      <div class="earn-row"><span>🐣 Easy complete</span><span class="earn-amount">+50 🪙</span></div>
      <div class="earn-row"><span>🔥 Hard complete</span><span class="earn-amount">+200 🪙</span></div>
      <div class="earn-row"><span>🎉 First Hard win</span><span class="earn-amount">+500 🪙</span></div>
      <div class="earn-row"><span>🔥 7-day streak</span><span class="earn-amount">+100 🪙</span></div>
    </div>`;
    html += `<div class="shop-section-title" style="margin-top:16px">⚡ Free Daily Boosters</div>`;
    html += `<div class="shop-earn-list">
      <div class="earn-row"><span>🔀 Shuffle</span><span class="earn-amount">1 free/day</span></div>
      <div class="earn-row"><span>↩️ Undo</span><span class="earn-amount">1 free/day</span></div>
      <div class="earn-row"><span>📤 Eject</span><span class="earn-amount">1 free/day</span></div>
      <div class="earn-row"><span>🔍 Peek</span><span class="earn-amount">Shop only</span></div>
      <div class="earn-row"><span>⚡ Auto-Match</span><span class="earn-amount">Shop only</span></div>
    </div>`;

    container.innerHTML = html;
  },

  // ── Collections Tab (Shop) ──
  renderCollectionsTab() {
    const container = document.getElementById('shop-content-collection');
    if (!container) return;
    const active = Collections.getActive();
    const coins = Storage.getCoins();

    let html = '<div class="shop-section-title">🎨 Tile Skin Collections</div>';
    html += '<p class="shop-subtitle">Change how your critters look in-game</p>';

    for (const [key, col] of Object.entries(Collections.COLLECTIONS)) {
      const isActive = key === active;
      const isUnlocked = col.unlocked;
      const canBuy = !isUnlocked && coins >= col.price;

      html += `<div class="shop-item">
        <div class="shop-item-header">
          <span class="shop-item-name">${col.name}</span>
          <span class="shop-item-owned">${col.rarity} · ${col.description}</span>
        </div>
        <div class="shop-packs" style="gap:4px;flex-wrap:wrap">
          ${Tiles.TYPES.slice(0,6).map(t => `<span style="width:28px;height:28px;border-radius:6px;display:inline-block;${Tiles.getClass(t)};background-size:65% auto;background-position:center 48%;box-shadow:0 1px 2px rgba(0,0,0,0.3)"></span>`).join('')}
        </div>
        <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center">`;
      if (isActive) {
        html += '<span class="collection-badge active" style="background:#2d5a2d;color:#8f8;padding:3px 10px;border-radius:12px;font-size:12px">✅ Equipped</span>';
      } else if (isUnlocked) {
        html += `<button class="btn btn-play btn-sm" onclick="Collections.setActive('${key}');Shop.renderCollectionsTab();UI.renderCollections();">👗 Equip</button>`;
      } else {
        html += `<span class="collection-badge price" style="background:#333;color:var(--clr-accent);padding:3px 10px;border-radius:12px;font-size:12px">🪙 ${col.price}</span>`;
        if (canBuy) {
          html += `<button class="btn btn-play btn-sm" onclick="if(Collections.purchase('${key}').success){Shop.refresh();UI.renderCollections();}">🛒 Buy</button>`;
        } else {
          html += `<button class="btn btn-play btn-sm btn--disabled" disabled>Need ${col.price - coins} 🪙</button>`;
        }
      }
      html += '</div></div>';
    }
    container.innerHTML = html;
  },
};
