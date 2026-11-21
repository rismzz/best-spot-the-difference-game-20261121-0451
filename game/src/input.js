// Pointer and keyboard input: maps a click to a footer button, a panel, or an
// overlay action, and turns keys into the same actions. The canvas keeps a fixed
// 1280x720 internal resolution, so client coordinates are scaled into it.
import {
  BUTTONS,
  FOOTER_Y,
  PANEL_H,
  PANEL_LEFT_X,
  PANEL_RIGHT_X,
  PANEL_W,
  PANEL_Y,
  VIEW_H,
  VIEW_W,
} from './config.js';
import {
  SCREEN_LEVEL_DONE,
  SCREEN_OVER,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_WIN,
} from './world.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_MUTE = 8;
export const ACTION_RESTART = 16;

export function createInput(canvas) {
  let actions = 0;
  let click = null; // { x, y } in canvas coordinates, consumed once per frame

  function toCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
      y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    click = toCanvas(event);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.code === 'Space' || event.code === 'Enter') actions |= ACTION_CONFIRM;
    else if (event.code === 'KeyP' || event.code === 'Escape') actions |= ACTION_PAUSE;
    else if (event.code === 'KeyH') actions |= ACTION_HINT;
    else if (event.code === 'KeyM') actions |= ACTION_MUTE;
    else if (event.code === 'KeyR') actions |= ACTION_RESTART;
  });

  function takeActions() {
    const taken = actions;
    actions = 0;
    return taken;
  }

  function takeClick() {
    const taken = click;
    click = null;
    return taken;
  }

  function buttonAt(x, y) {
    for (const key of Object.keys(BUTTONS)) {
      const b = BUTTONS[key];
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return key;
    }
    return null;
  }

  /** Which panel (0 left, 1 right) a canvas point is on, with scene coordinates. */
  function panelAt(x, y) {
    if (y < PANEL_Y || y > PANEL_Y + PANEL_H) return null;
    if (x >= PANEL_LEFT_X && x <= PANEL_LEFT_X + PANEL_W) {
      return { panel: 0, sceneX: x - PANEL_LEFT_X, sceneY: y - PANEL_Y };
    }
    if (x >= PANEL_RIGHT_X && x <= PANEL_RIGHT_X + PANEL_W) {
      return { panel: 1, sceneX: x - PANEL_RIGHT_X, sceneY: y - PANEL_Y };
    }
    return null;
  }

  return { takeActions, takeClick, buttonAt, panelAt };
}

/**
 * Apply one frame of input to the world. Returns a sound to play:
 * 'click' | 'found' | 'wrong' | 'clear' | 'hint' | 'levelClear' | 'win' | 'timeUp' | null.
 * `now` is seconds since the page loaded (performance.now() / 1000).
 */
export function handleInput(world, input, audio, now) {
  const { state } = world;
  const actions = input.takeActions();
  const click = input.takeClick();
  let sound = null;

  if (actions & ACTION_MUTE) {
    audio.toggleMuted();
    return 'click';
  }

  if (click !== null && click.y >= FOOTER_Y && click.y <= VIEW_H) {
    const button = input.buttonAt(click.x, click.y);
    if (button === 'hint' && state.screen === SCREEN_PLAY) {
      if (world.useHint(now) !== null) sound = 'hint';
    } else if (button === 'pause') {
      if (state.screen === SCREEN_PLAY) state.screen = SCREEN_PAUSED;
      else if (state.screen === SCREEN_PAUSED) state.screen = SCREEN_PLAY;
      sound = 'click';
    } else if (button === 'sound') {
      audio.toggleMuted();
      sound = 'click';
    } else if (button === 'restart') {
      world.startGame();
      sound = 'click';
    }
    return sound;
  }

  if (actions & ACTION_HINT && state.screen === SCREEN_PLAY) {
    if (world.useHint(now) !== null) return 'hint';
  }
  if (actions & ACTION_RESTART) {
    world.startGame();
    return 'click';
  }
  if (actions & ACTION_PAUSE) {
    if (state.screen === SCREEN_PLAY) state.screen = SCREEN_PAUSED;
    else if (state.screen === SCREEN_PAUSED) state.screen = SCREEN_PLAY;
    return 'click';
  }

  if (state.screen === SCREEN_TITLE) {
    if (click !== null || actions & ACTION_CONFIRM) {
      audio.unlock();
      world.startGame();
      return 'click';
    }
    return null;
  }
  if (state.screen === SCREEN_LEVEL_DONE) {
    if (click !== null || actions & ACTION_CONFIRM) {
      const wasLast = state.levelIndex + 1 >= state.levels.length;
      world.nextLevel();
      return wasLast ? 'win' : 'levelClear';
    }
    return null;
  }
  if (state.screen === SCREEN_OVER || state.screen === SCREEN_WIN) {
    if (click !== null || actions & ACTION_CONFIRM) {
      audio.unlock();
      world.startGame();
      return 'click';
    }
    return null;
  }
  if (state.screen === SCREEN_PAUSED) {
    if (click !== null || actions & ACTION_CONFIRM) {
      state.screen = SCREEN_PLAY;
      return 'click';
    }
    return null;
  }

  // SCREEN_PLAY: a click on a panel hunts for a difference.
  if (click !== null) {
    audio.unlock();
    const hit = input.panelAt(click.x, click.y);
    if (hit !== null) {
      const result = world.clickPanel(hit.sceneX, hit.sceneY, hit.panel, now);
      if (result === 'found') return 'found';
      if (result === 'wrong') return 'wrong';
      if (result === 'clear') return 'levelClear';
    }
  }
  return sound;
}
