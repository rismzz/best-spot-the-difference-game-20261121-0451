// Game state and rules: levels, finds, streaks, timer, hints and scoring.
// Rendering lives in render.js; input in input.js; this file only decides.
import {
  BEST_KEY,
  FIND_POINTS,
  HINTS_PER_LEVEL,
  HINT_MS,
  STREAK_BONUS,
  TIME_BONUS_PER_SECOND,
  WRONG_COST_SECONDS,
} from './config.js';
import { buildLevels } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_DONE = 'levelDone';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

export function createWorld(seed) {
  const levels = buildLevels(seed);
  const state = {
    levels,
    screen: SCREEN_TITLE,
    levelIndex: 0,
    found: new Set(),
    strikes: 0,
    score: 0,
    totalScore: 0,
    streak: 0,
    bestStreak: 0,
    timeLeft: levels[0].seconds,
    hintsLeft: HINTS_PER_LEVEL,
    hint: null, // { diff, until }
    clicks: 0,
    hits: 0,
    best: readBest(),
    flash: null, // { kind: 'good' | 'bad', until }
    particles: [],
    levelBonus: 0,
    message: '',
  };

  function readBest() {
    try {
      return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
    } catch {
      return 0;
    }
  }

  function saveBest(value) {
    try {
      window.localStorage.setItem(BEST_KEY, String(value));
    } catch {
      // Storage can be off: the best score then lasts this visit only.
    }
  }

  function level() {
    return levels[state.levelIndex];
  }

  function startLevel(index) {
    state.levelIndex = index;
    state.found = new Set();
    state.strikes = 0;
    state.streak = 0;
    state.timeLeft = levels[index].seconds;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.hint = null;
    state.particles = [];
    state.levelBonus = 0;
    state.screen = SCREEN_PLAY;
  }

  function startGame() {
    state.totalScore = 0;
    state.score = 0;
    state.clicks = 0;
    state.hits = 0;
    state.bestStreak = 0;
    startLevel(0);
  }

  function addParticle(x, y, panel) {
    for (let i = 0; i < 14; i += 1) {
      const angle = (i / 14) * Math.PI * 2;
      state.particles.push({
        x,
        y,
        panel,
        vx: Math.cos(angle) * (30 + (i % 3) * 22),
        vy: Math.sin(angle) * (30 + (i % 3) * 22),
        life: 0.6,
        maxLife: 0.6,
      });
    }
  }

  function findAt(sceneX, sceneY) {
    const current = level();
    let best = null;
    let bestDistance = Infinity;
    for (const diff of current.diffs) {
      if (state.found.has(diff.id)) continue;
      const distance = Math.hypot(diff.x - sceneX, diff.y - sceneY);
      if (distance <= diff.r + 14 && distance < bestDistance) {
        best = diff;
        bestDistance = distance;
      }
    }
    return best;
  }

  /** A click on a panel at scene coordinates. Returns 'found' | 'wrong' | 'none'. */
  function clickPanel(sceneX, sceneY, panel, now) {
    if (state.screen !== SCREEN_PLAY) return 'none';
    state.clicks += 1;
    const diff = findAt(sceneX, sceneY);
    if (diff === null) {
      state.strikes += 1;
      state.streak = 0;
      state.timeLeft = Math.max(0, state.timeLeft - WRONG_COST_SECONDS);
      state.flash = { kind: 'bad', until: now + 0.35 };
      return 'wrong';
    }
    state.found.add(diff.id);
    state.hits += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    const gained = FIND_POINTS + state.streak * STREAK_BONUS;
    state.score += gained;
    state.flash = { kind: 'good', until: now + 0.3 };
    addParticle(diff.x, diff.y, panel);
    if (state.hint !== null && state.hint.diff.id === diff.id) state.hint = null;
    if (state.found.size === level().diffs.length) {
      const bonus = Math.round(state.timeLeft) * TIME_BONUS_PER_SECOND;
      state.levelBonus = bonus;
      state.totalScore = state.score + bonus;
      state.screen = SCREEN_LEVEL_DONE;
      state.message = `Level clear! Time bonus +${bonus}.`;
      return 'clear';
    }
    return 'found';
  }

  function nextLevel() {
    if (state.levelIndex + 1 >= levels.length) {
      state.totalScore = state.score;
      state.screen = SCREEN_WIN;
      if (state.totalScore > state.best) {
        state.best = state.totalScore;
        saveBest(state.best);
      }
      return;
    }
    state.score = state.totalScore;
    startLevel(state.levelIndex + 1);
  }

  function useHint(now) {
    if (state.screen !== SCREEN_PLAY || state.hintsLeft <= 0) return null;
    const remaining = level().diffs.filter((d) => !state.found.has(d.id));
    if (remaining.length === 0) return null;
    const diff = remaining[Math.floor(Math.random() * remaining.length)];
    state.hintsLeft -= 1;
    state.hint = { diff, until: now + HINT_MS / 1000 };
    return diff;
  }

  function tick(seconds, now) {
    if (state.screen !== SCREEN_PLAY) return;
    state.timeLeft -= seconds;
    if (state.hint !== null && now > state.hint.until) state.hint = null;
    if (state.flash !== null && now > state.flash.until) state.flash = null;
    state.particles = state.particles.filter((p) => {
      p.life -= seconds;
      p.x += p.vx * seconds;
      p.y += p.vy * seconds;
      return p.life > 0;
    });
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.totalScore = state.score;
      state.screen = SCREEN_OVER;
      if (state.totalScore > state.best) {
        state.best = state.totalScore;
        saveBest(state.best);
      }
    }
  }

  return {
    state,
    level,
    startGame,
    startLevel,
    clickPanel,
    nextLevel,
    useHint,
    tick,
  };
}
