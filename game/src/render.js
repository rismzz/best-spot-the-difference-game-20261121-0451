// Everything the player sees: the two panels, the HUD and the screens.
// Scenes are painted once per level onto offscreen canvases; each frame blits them
// and draws the markers, hint pulse, particles and overlays on top.
import {
  BUTTONS,
  COLORS,
  FOOTER_Y,
  HEADER_H,
  PANEL_H,
  PANEL_LEFT_X,
  PANEL_RIGHT_X,
  PANEL_W,
  PANEL_Y,
  VIEW_H,
  VIEW_W,
} from './config.js';
import { SCENE_H, SCENE_W } from './scenes.js';
import {
  SCREEN_LEVEL_DONE,
  SCREEN_OVER,
  SCREEN_PAUSED,
  SCREEN_TITLE,
  SCREEN_WIN,
} from './world.js';

function text(ctx, value, x, y, font, fill, align = 'left') {
  ctx.font = font;
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function pill(ctx, x, y, w, h, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const sceneCache = new Map(); // levelIndex -> { left, right }

  function sceneCanvases(levelIndex, level) {
    const cached = sceneCache.get(levelIndex);
    if (cached) return cached;
    const left = document.createElement('canvas');
    left.width = SCENE_W;
    left.height = SCENE_H;
    const right = document.createElement('canvas');
    right.width = SCENE_W;
    right.height = SCENE_H;
    level.draw(left.getContext('2d'), new Set());
    const all = new Set(level.diffs.map((d) => d.id));
    level.draw(right.getContext('2d'), all);
    const pair = { left, right };
    sceneCache.set(levelIndex, pair);
    return pair;
  }

  function drawPanels(state, now) {
    const level = state.levels[state.levelIndex];
    const { left, right } = sceneCanvases(state.levelIndex, level);
    ctx.drawImage(left, PANEL_LEFT_X, PANEL_Y);
    ctx.drawImage(right, PANEL_RIGHT_X, PANEL_Y);
    for (const panel of [0, 1]) {
      const x = panel === 0 ? PANEL_LEFT_X : PANEL_RIGHT_X;
      ctx.strokeStyle = COLORS.panelEdge;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, PANEL_Y, PANEL_W, PANEL_H);
      pill(ctx, x + 10, PANEL_Y + 10, 92, 26, 'rgba(10, 8, 24, 0.65)');
      text(ctx, panel === 0 ? 'PANEL A' : 'PANEL B', x + 56, PANEL_Y + 24, 'bold 13px system-ui, sans-serif', COLORS.ink, 'center');
    }
    // Rings on every difference already found, on both panels.
    for (const diff of level.diffs) {
      if (!state.found.has(diff.id)) continue;
      for (const panel of [0, 1]) {
        const x = (panel === 0 ? PANEL_LEFT_X : PANEL_RIGHT_X) + diff.x;
        const y = PANEL_Y + diff.y;
        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, diff.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(10, 8, 24, 0.8)';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(x, y, diff.r + 3, 0, Math.PI * 2);
        ctx.stroke();
        text(ctx, '✓', x, y - 1, 'bold 26px system-ui, sans-serif', COLORS.gold, 'center');
      }
    }
    // Hint pulse around one unfound difference, on both panels.
    if (state.hint !== null && state.screen === 'play') {
      const pulse = 1 + 0.12 * Math.sin(now * 6);
      for (const panel of [0, 1]) {
        const x = (panel === 0 ? PANEL_LEFT_X : PANEL_RIGHT_X) + state.hint.diff.x;
        const y = PANEL_Y + state.hint.diff.y;
        ctx.strokeStyle = 'rgba(126, 224, 129, 0.9)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, state.hint.diff.r * pulse + 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Sparkle particles where a difference was just found.
    for (const p of state.particles) {
      const x = (p.panel === 0 ? PANEL_LEFT_X : PANEL_RIGHT_X) + p.x;
      const y = PANEL_Y + p.y;
      ctx.fillStyle = `rgba(255, 209, 102, ${Math.max(0, p.life / p.maxLife)})`;
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (state.flash !== null && now < state.flash.until) {
      ctx.strokeStyle = state.flash.kind === 'good' ? 'rgba(255, 209, 102, 0.7)' : 'rgba(255, 107, 107, 0.7)';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, VIEW_W - 8, VIEW_H - 8);
    }
  }

  function drawHeader(state) {
    ctx.fillStyle = COLORS.hud;
    ctx.fillRect(0, 0, VIEW_W, HEADER_H);
    text(ctx, '★ TWIN STARS', 20, HEADER_H / 2, 'bold 26px system-ui, sans-serif', COLORS.gold);
    const level = state.levels[state.levelIndex];
    text(
      ctx,
      `LEVEL ${state.levelIndex + 1} · ${level.name.toUpperCase()} — ${level.subtitle}`,
      VIEW_W / 2,
      HEADER_H / 2,
      'bold 15px system-ui, sans-serif',
      COLORS.dim,
      'center',
    );
    text(ctx, `SCORE ${state.score.toLocaleString()}`, VIEW_W - 200, HEADER_H / 2 - 11, 'bold 16px system-ui, sans-serif', COLORS.ink, 'right');
    text(ctx, `BEST ${state.best.toLocaleString()}`, VIEW_W - 200, HEADER_H / 2 + 12, '13px system-ui, sans-serif', COLORS.dim, 'right');
  }

  function drawFooter(state) {
    ctx.fillStyle = COLORS.hud;
    ctx.fillRect(0, FOOTER_Y, VIEW_W, VIEW_H - FOOTER_Y);
    for (const key of Object.keys(BUTTONS)) {
      const b = BUTTONS[key];
      const label = key === 'hint' ? `HINT (${state.hintsLeft})` : b.label;
      pill(ctx, b.x, b.y, b.w, b.h, '#332a52', COLORS.panelEdge);
      text(ctx, label, b.x + b.w / 2, b.y + b.h / 2 + 1, 'bold 15px system-ui, sans-serif', COLORS.ink, 'center');
    }
    // Timer bar with the seconds left.
    const level = state.levels[state.levelIndex];
    const fraction = Math.max(0, state.timeLeft / level.seconds);
    const barX = 700;
    const barW = 300;
    ctx.fillStyle = '#17122a';
    ctx.beginPath();
    ctx.roundRect(barX, 664, barW, 28, 14);
    ctx.fill();
    const barColor = state.timeLeft <= 30 ? '#ff6b6b' : state.timeLeft <= 60 ? '#ffb347' : '#7ee081';
    ctx.fillStyle = barColor;
    ctx.beginPath();
    ctx.roundRect(barX, 664, Math.max(28, barW * fraction), 28, 14);
    ctx.fill();
    text(ctx, `${Math.ceil(state.timeLeft)}s`, barX + barW / 2, 679, 'bold 15px system-ui, sans-serif', '#14101f', 'center');
    // Streak and found counter.
    text(ctx, state.streak >= 2 ? `🔥 STREAK x${state.streak}` : '', 1104, 679, 'bold 15px system-ui, sans-serif', '#ffb347', 'right');
    const found = state.found.size;
    const total = level.diffs.length;
    pill(ctx, 1112, 656, 152, 48, found === total ? '#2a9d8f' : '#332a52', COLORS.gold);
    text(ctx, `FOUND ${found} / ${total}`, 1188, 681, 'bold 16px system-ui, sans-serif', COLORS.ink, 'center');
  }

  function overlay(title, lines, accent, alpha = 0.78) {
    ctx.fillStyle = `rgba(8, 6, 20, ${alpha})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    text(ctx, title, VIEW_W / 2, 250, 'bold 54px system-ui, sans-serif', accent, 'center');
    lines.forEach((line, index) => {
      text(ctx, line, VIEW_W / 2, 330 + index * 34, '18px system-ui, sans-serif', COLORS.ink, 'center');
    });
  }

  function draw(state, now) {
    ctx.fillStyle = '#14101f';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    drawPanels(state, now);
    drawHeader(state);
    drawFooter(state);
    if (state.screen === SCREEN_TITLE) {
      overlay('★ TWIN STARS ★', [
        'Spot the Difference — three hand-drawn scenes, 28 hidden differences.',
        'Click a difference on EITHER panel. Wrong clicks cost 5 seconds.',
        'H hints at one for you · P pauses · M mutes · R restarts.',
        '',
        'CLICK OR PRESS SPACE TO START',
      ], COLORS.gold, 0.66);
      const levels = state.levels;
      levels.forEach((level, index) => {
        text(
          ctx,
          `${index + 1}. ${level.name} — ${level.diffs.length} differences · ${level.seconds}s`,
          VIEW_W / 2,
          500 + index * 28,
          '16px system-ui, sans-serif',
          COLORS.dim,
          'center',
        );
      });
      if (state.best > 0) {
        text(ctx, `Best score: ${state.best.toLocaleString()}`, VIEW_W / 2, 600, 'bold 16px system-ui, sans-serif', COLORS.gold, 'center');
      }
    } else if (state.screen === SCREEN_PAUSED) {
      overlay('PAUSED', ['Take a breath. The timer is stopped.', '', 'Press P or click to keep hunting.'], COLORS.ink);
    } else if (state.screen === SCREEN_LEVEL_DONE) {
      overlay('LEVEL CLEAR!', [
        state.message,
        `Score so far: ${state.totalScore.toLocaleString()}`,
        '',
        'CLICK TO PLAY THE NEXT LEVEL',
      ], COLORS.good);
    } else if (state.screen === SCREEN_OVER) {
      overlay("TIME'S UP", [
        `You found ${state.found.size} of ${state.levels[state.levelIndex].diffs.length} differences on this level.`,
        `Score: ${state.score.toLocaleString()} · Best: ${state.best.toLocaleString()}`,
        '',
        'CLICK OR PRESS SPACE TO TRY AGAIN',
      ], COLORS.bad);
    } else if (state.screen === SCREEN_WIN) {
      const accuracy = state.clicks === 0 ? 0 : Math.round((state.hits / state.clicks) * 100);
      overlay('YOU FOUND THEM ALL!', [
        `All 28 differences across 3 scenes. Total score: ${state.totalScore.toLocaleString()}`,
        `Accuracy ${accuracy}% · Best streak x${state.bestStreak} · Best score ${state.best.toLocaleString()}`,
        '',
        'CLICK OR PRESS SPACE TO PLAY AGAIN',
      ], COLORS.gold);
    }
  }

  return { draw, sceneCanvases };
}
