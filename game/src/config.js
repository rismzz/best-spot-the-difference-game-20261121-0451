// Shared layout and tuning for Twin Stars, the spot-the-difference game.
// One canvas, fixed 1280x720 internal resolution, scaled by CSS to fit the window.
export const VIEW_W = 1280;
export const VIEW_H = 720;

export const HEADER_H = 64;
export const PANEL_Y = 76;
export const PANEL_W = 608;
export const PANEL_H = 560;
export const PANEL_LEFT_X = 16;
export const PANEL_RIGHT_X = 656;
export const FOOTER_Y = 648;
export const FOOTER_H = 64;

// Footer buttons, laid out left to right. input.js hit-tests these rects.
export const BUTTONS = {
  hint: { x: 16, y: 656, w: 150, h: 48, label: 'HINT (H)' },
  pause: { x: 178, y: 656, w: 150, h: 48, label: 'PAUSE (P)' },
  sound: { x: 340, y: 656, w: 150, h: 48, label: 'SOUND (M)' },
  restart: { x: 502, y: 656, w: 170, h: 48, label: 'RESTART (R)' },
};

export const BEST_KEY = 'twin-stars-best';
export const STEP = 1 / 60;

// How many hints a level starts with, and how long a hint pulse lasts.
export const HINTS_PER_LEVEL = 3;
export const HINT_MS = 3000;
// A wrong click costs this many seconds and resets the streak.
export const WRONG_COST_SECONDS = 5;
// Points for a find, plus this per point of the current streak.
export const FIND_POINTS = 100;
export const STREAK_BONUS = 10;
// Points per second left when a level is cleared.
export const TIME_BONUS_PER_SECOND = 5;

export const COLORS = {
  ink: '#f5efe0',
  dim: '#cfc6ae',
  panelEdge: '#3d3358',
  gold: '#ffd166',
  good: '#7ee081',
  bad: '#ff6b6b',
  hud: '#241d3d',
};
