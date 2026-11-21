// Staged screenshot scenes behind ?shot=start|play|play2|win (with &seed=N).
// Each one plays the real rules forward into a fixed frame, so the screenshots are
// what a real game looks like: the title over level 1, a mid-hunt with found
// markers and several differences still unfound, a harder level mid-hunt, and the win.
import { SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';

function markFound(world, count) {
  const level = world.level();
  const ids = level.diffs.slice(0, count).map((d) => d.id);
  world.state.found = new Set(ids);
  world.state.hits = count;
  world.state.clicks = count;
}

/**
 * Stage the named scene on the world and return the screen to draw.
 * The caller paints twice, then sets window.__shotReady for the screenshot.
 */
export function stageShot(name, world) {
  const { state } = world;
  if (name === 'play') {
    world.startLevel(0);
    markFound(world, 3);
    state.streak = 3;
    state.bestStreak = 3;
    state.score = 340;
    state.timeLeft = 151;
    return SCREEN_PLAY;
  }
  if (name === 'play2') {
    world.startGame();
    world.state.score = 980;
    world.startLevel(1);
    markFound(world, 5);
    state.streak = 4;
    state.bestStreak = 4;
    state.score = 980 + 620;
    state.timeLeft = 97;
    state.hintsLeft = 2;
    return SCREEN_PLAY;
  }
  if (name === 'win') {
    world.startGame();
    state.screen = SCREEN_WIN;
    state.totalScore = 4860;
    state.score = 4860;
    state.best = 4860;
    state.clicks = 34;
    state.hits = 28;
    state.bestStreak = 9;
    state.levelIndex = 2;
    state.timeLeft = 24;
    markFound(world, 12);
    state.clicks = 34;
    state.hits = 28;
    return SCREEN_WIN;
  }
  // Any other name is the title screen over level 1.
  state.screen = SCREEN_TITLE;
  state.levelIndex = 0;
  return SCREEN_TITLE;
}
