// chat.js — TripleTails v1.2
// Phase 8: Alliance Chat with 20 AI bots
const Chat = {
  _bots: null,
  _alliance: [], // 5 assigned alliance bots
  _messages: [],
  _msgId: 0,

  // Message templates by category
  TEMPLATES: {
    morning: [
      "Good morning, forest friends! ☀️ Ready to clear some tails today?",
      "Rise and shine! 🌅 Another beautiful day in the Enchanted Forest!",
      "Morning everyone! ☕ Who's tackling the hard board today?",
      "Good morning! 🌻 May the critters align for you today!",
      "Hey squad! 🌤️ Let's break some tail curses!"
    ],
    game_start: [
      "Let's go! 🎮 Going for the easy board first to warm up ⚡",
      "Starting my daily grind! 💪 Those critters aren't gonna match themselves",
      "Diving in! 🏊 Who else is playing right now?",
      "Game time! 🎯 Going straight for the hard board today 🔥",
      "Wish me luck! 🍀 Those Lunar Lights critters look amazing today"
    ],
    easy_win: [
      "Nice! Grabbed my 50 coins from the easy board ✅ On to hard!",
      "Easy board down in {time}! 🎉 Now the real challenge begins...",
      "First board cleared! 🪙 Who else finished already?",
      "That was smooth sailing 🌊 Hard board, you're next!",
      "Easy peasy! 🐰 50 coins earned, time for the 7-layer nightmare 😈"
    ],
    hard_win: [
      "7 LAYERS DEFEATED! 🏆🔥 That was INTENSE! {time} of pure focus!",
      "EXTREME HARD CONQUERED! 💀→😎 The cursed tails are restored!",
      "200 COINS! 🪙🪙 7 layers couldn't stop me today! Who else did it?",
      "VICTORY! 🎊 That last layer had me sweating but we made it!",
      "Hard board: CLEARED ✅ 120 tiles, 7 layers, 10 critters — DONE!"
    ],
    hard_struggling: [
      "Stuck on layer 5... 😭 This board is brutal today",
      "I need a shuffle booster ASAP! 🔀 That hard board is no joke",
      "Layer 6 is mocking me 😤 Anyone got tips for the hard board?",
      "Spent 10 minutes already... 💀 those blocked tiles are MEAN today",
      "The shuffle saved me! 🙏 Never giving up on this board"
    ],
    idle: [
      "Just vibin' in the forest 🌿 The critters look so cute today",
      "Did anyone else buy the Ocean Buddies collection? 🌊 It's gorgeous!",
      "Saving up for Lunar Lights... 🌙 only 400 coins to go!",
      "The music in this game is so calming 🎵 Perfect Sunday vibes",
      "Taking a break ☕ back for the hard board in a bit!"
    ],
    collection_unlock: [
      "I just unlocked {collection}! 🌊 The critters look AMAZING with the new skin!",
      "NEW COLLECTION ALERT! 🎨 Finally got {collection} — worth every coin!",
      "Guys, {collection} is BEAUTIFUL 😍 You gotta see the sparkle effects!",
      "Bought {collection} and WOW 🤩 The tile animations pop so much more now!",
      "Collection complete! ✅ {collection} is now part of my arsenal 🎨"
    ],
    boast: [
      "Finished hard in {time}! ⚡ Anyone beat that today? 🏆",
      "New personal record! 📊 This daily puzzle felt easier than yesterday",
      "Top {rank} on the leaderboard? I'll take it! 💪😤",
      "{time} on hard mode — can anyone top that? 🔥",
      "Leaderboard checking... 👀 Yep, still holding my spot!"
    ],
    bot_chatter: [
      "I'm trying a new strategy: clear layers from the outside in 🧠",
      "Pro tip: save your Peek booster for layer 6-7, trust me 💡",
      "The RNG was kind today 🙏 Found 3 matches back to back!",
      "Hot take: the penguin critter is the cutest and I will defend this 🔥🐧",
      "I count tiles before tapping now — game changer for hard mode 📊",
      "Anyone else notice the giraffe tiles are easier to spot? 🦒 Just me?",
      "Shuffle is the MVP booster, change my mind 🔀",
      "Day 30 streak incoming! 🎯 The daily grind never stops",
    ],
  },

  _ready: false,

  async init() {
    // Load 20 alliance bots from bots.json
    try {
      const resp = await fetch('data/bots.json');
      if (resp.ok) {
        const all = await resp.json();
        this._bots = all.filter(b => b.group === 'alliance');
      }
    } catch (e) {
      console.warn('[Chat] Could not load alliance bots:', e.message);
    }

    // Pick 5 alliance bots for this player (persisted)
    const assigned = Storage.get('bot_assignment');
    if (assigned && assigned.length === 5) {
      this._alliance = assigned;
    } else if (this._bots && this._bots.length >= 5) {
      const shuffled = [...this._bots].sort(() => Math.random() - 0.5);
      this._alliance = shuffled.slice(0, 5).map(b => ({ id: b.id, name: b.name, animal: b.animal, personality: b.personality, chatStyle: b.chatStyle }));
      Storage.set('bot_assignment', this._alliance);
    }

    // Load message history
    const saved = Storage.get('chat_log');
    this._messages = saved || [];
    if (this._messages.length > 0) {
      this._msgId = Math.max(...this._messages.map(m => m._id || 0)) + 1;
    }

    // Greet once per day (any time)
    this._checkDailyGreeting();

    // Seed chat synchronously so messages exist immediately
    if (this._messages.length === 0) {
      this.botMessage('morning');
      this.botMessage('bot_chatter');
      this.botMessage('bot_chatter');
    } else if (this._messages.length < 3) {
      this.botMessage('bot_chatter');
    }

    this._ready = true;

    // Start idle bot chatter loop (fires during active gameplay)
    this.scheduleIdleChatter();
  },

  getMessages() { return this._messages; },

  sendMessage(text, sender) {
    const msg = {
      _id: this._msgId++,
      sender,
      text,
      timestamp: Date.now(),
    };
    this._messages.push(msg);
    this._save();
    return msg;
  },

  // Bot sends a message (picks from category templates)
  botMessage(category, context) {
    if (!this._alliance.length) return null;

    // Pick a random alliance bot
    const bot = this._alliance[Math.floor(Math.random() * this._alliance.length)];
    const templates = this.TEMPLATES[category] || this.TEMPLATES.bot_chatter;
    let text = templates[Math.floor(Math.random() * templates.length)];

    // Fill context vars
    if (context) {
      for (const [key, val] of Object.entries(context)) {
        text = text.replace(`{${key}}`, val);
      }
    }

    const msg = {
      _id: this._msgId++,
      sender: 'bot',
      botName: bot.name,
      animal: bot.animal,
      style: bot.chatStyle,
      text,
      timestamp: Date.now() - Math.floor(Math.random() * 60000), // random within last minute
    };
    this._messages.push(msg);
    this._save();
    return msg;
  },

  // Check if morning greeting due
  _checkDailyGreeting() {
    const today = App._gameDay();
    const lastGreet = Storage.get('chat_lastGreeting');
    if (lastGreet === today) return;
    // Greet once per day on first visit, any time
    this.botMessage('morning');
    Storage.set('chat_lastGreeting', today);
  },

  // Trigger bot messages for game events
  onGameStart(difficulty) {
    this.botMessage('game_start');
  },
  onEasyWin(time) {
    this.botMessage('easy_win', { time });
  },
  onHardWin(time) {
    this.botMessage('hard_win', { time });
    // Another bot might boast too
    if (Math.random() < 0.4) {
      setTimeout(() => this.botMessage('boast', { time }), 3000 + Math.random() * 5000);
    }
  },
  onGameOver() {
    if (Math.random() < 0.3) {
      this.botMessage('hard_struggling');
    }
  },
  onCollectionUnlock(name) {
    this.botMessage('collection_unlock', { collection: name });
  },

  // Idle bot chatter (call periodically during game)
  scheduleIdleChatter() {
    const delay = 30000 + Math.random() * 120000; // 30s-2.5min
    setTimeout(() => {
      if (document.getElementById('screen-game')?.classList.contains('screen--active')) {
        this.botMessage('idle');
      }
      this.scheduleIdleChatter();
    }, delay);
  },

  _save() {
    // Keep last 200 messages max
    if (this._messages.length > 200) {
      this._messages = this._messages.slice(-200);
    }
    Storage.set('chat_log', this._messages);
  },
};
