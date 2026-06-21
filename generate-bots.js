// generate-bots.js — Generate bots.json for TripleTails leaderboard
// Run: node generate-bots.js
const fs = require('fs');
const path = require('path');

const ANIMALS = ['fox','owl','deer','bear','wolf','cat','dog','bird','frog','mouse','duck','turtle','hamster','koala','otter','badger','raccoon','squirrel','hedgehog','bat'];
const ADJECTIVES_PRO = ['Swift','Sharp','Elite','Ace','Pro','Master','Blitz','Prime','Alpha','Ultra'];
const ADJECTIVES_MED = ['Happy','Clever','Brave','Lucky','Sunny','Cosy','Jolly','Zippy','Breezy','Perky'];
const ADJECTIVES_LAZY = ['Sleepy','Chill','SloMo','Dozey','Mellow','Napper','Drowsy','Snail','Pokey','Laze'];
const NOUNS = ['Paw','Claw','Tail','Whisker','Nose','Ear','Fang','Tuft','Fluff','Pounce','Nibble','Scamper','Prowl','Leap','Dash'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function genName(group) {
  const adj = group === 'pro' ? pick(ADJECTIVES_PRO) : group === 'medium' ? pick(ADJECTIVES_MED) : group === 'lazy' ? pick(ADJECTIVES_LAZY) : pick([...ADJECTIVES_LAZY, 'Lost','Gone','Away','MIA']);
  return `${adj}${pick(NOUNS)}`;
}

const bots = [];
let id = 1;

// Pro: 30 bots — complete very early (30s-5min)
for (let i = 0; i < 30; i++) {
  bots.push({
    id, name: genName('pro'), group: 'pro', animal: pick(ANIMALS),
    windowMin: 30, windowMax: 300,
    personality: pick(['competitive','analytical','perfectionist']),
    chatStyle: pick(['encouraging','boastful','helpful']),
  }); id++;
}

// Medium: 50 bots — complete mid-range (5min-25min)
for (let i = 0; i < 50; i++) {
  bots.push({
    id, name: genName('medium'), group: 'medium', animal: pick(ANIMALS),
    windowMin: 300, windowMax: 1500,
    personality: pick(['casual','determined','social']),
    chatStyle: pick(['chatty','optimistic','curious']),
  }); id++;
}

// Lazy: 60 bots — complete late or barely (25min-2hr)
for (let i = 0; i < 60; i++) {
  bots.push({
    id, name: genName('lazy'), group: 'lazy', animal: pick(ANIMALS),
    windowMin: 1500, windowMax: 7200,
    personality: pick(['relaxed','distracted','indifferent']),
    chatStyle: pick(['complaining','joking','sleepy']),
  }); id++;
}

// MIA: 40 bots — may or may not complete (50% chance, 1hr-4hr)
for (let i = 0; i < 40; i++) {
  bots.push({
    id, name: genName('mia'), group: 'mia', animal: pick(ANIMALS),
    windowMin: 3600, windowMax: 14400,
    completionChance: 0.5,
    personality: pick(['ghost','forgetful','nomad']),
    chatStyle: pick(['rare','mysterious','confused']),
  }); id++;
}

// Alliance: 20 bots (for Phase 8 chat)
for (let i = 0; i < 20; i++) {
  bots.push({
    id, name: genName('medium'), group: 'alliance', animal: pick(ANIMALS),
    windowMin: 300, windowMax: 3600,
    personality: pick(['friendly','loyal','talkative']),
    chatStyle: pick(['supportive','funny','dramatic']),
  }); id++;
}

const outPath = path.join(__dirname, 'data', 'bots.json');
fs.writeFileSync(outPath, JSON.stringify(bots, null, 2));
console.log(`Generated ${bots.length} bots: Pro=30 Medium=50 Lazy=60 MIA=40 Alliance=20`);
