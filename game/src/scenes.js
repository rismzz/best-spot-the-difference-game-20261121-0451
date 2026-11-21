// The three scenes of Twin Stars. Each level builds one scene from a seed: the decoration
// (stars, clouds, fireflies) is generated once, so the left and right panels match exactly
// except for the level's differences. draw(ctx, variant) paints the scene; `variant` is the
// set of difference ids applied to that panel (empty for the left panel, all of them for
// the right one). Every difference also carries the spot a player must click.
import { createRandom, rangeInt } from './random.js';

export const SCENE_W = 608;
export const SCENE_H = 560;

function circle(ctx, x, y, radius, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, stroke, width) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/** A four-point sparkle, used for stars. */
function sparkle(ctx, x, y, size, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.quadraticCurveTo(x, y, x + size, y);
  ctx.quadraticCurveTo(x, y, x, y + size);
  ctx.quadraticCurveTo(x, y, x - size, y);
  ctx.quadraticCurveTo(x, y, x, y - size);
  ctx.fill();
}

function cloud(ctx, x, y, scale, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, 42 * scale, 16 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 26 * scale, y + 6 * scale, 26 * scale, 12 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 28 * scale, y + 6 * scale, 28 * scale, 13 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function gull(ctx, x, y, scale, stroke) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 12 * scale, y);
  ctx.quadraticCurveTo(x - 5 * scale, y - 8 * scale, x, y);
  ctx.quadraticCurveTo(x + 5 * scale, y - 8 * scale, x + 12 * scale, y);
  ctx.stroke();
}

function pine(ctx, x, y, height, dark, snow) {
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.moveTo(x, y - height);
  ctx.lineTo(x - height * 0.32, y - height * 0.45);
  ctx.lineTo(x - height * 0.18, y - height * 0.5);
  ctx.lineTo(x - height * 0.42, y);
  ctx.lineTo(x + height * 0.42, y);
  ctx.lineTo(x + height * 0.18, y - height * 0.5);
  ctx.lineTo(x + height * 0.32, y - height * 0.45);
  ctx.closePath();
  ctx.fill();
  rect(ctx, x - 4, y, 8, 12, '#4a3220');
  if (snow) {
    ctx.fillStyle = 'rgba(240, 244, 255, 0.85)';
    ctx.beginPath();
    ctx.moveTo(x, y - height);
    ctx.lineTo(x - height * 0.12, y - height * 0.78);
    ctx.lineTo(x + height * 0.12, y - height * 0.78);
    ctx.closePath();
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Level 1 — Harbor Dusk. 7 differences, 180 seconds.
// ---------------------------------------------------------------------------
function buildHarbor(seed) {
  const random = createRandom(seed);
  const clouds = [
    { x: 120, y: 78, s: 1.0 },
    { x: 300, y: 56, s: 0.8 },
    { x: 480, y: 108, s: 0.9 },
  ];
  const waves = [];
  for (let i = 0; i < 26; i += 1) {
    waves.push({
      x: rangeInt(random, 10, 590),
      y: rangeInt(random, 380, 545),
      len: rangeInt(random, 24, 70),
    });
  }
  const gulls = [
    { x: 250, y: 96, s: 1 },
    { x: 330, y: 78, s: 0.9 },
    { x: 408, y: 112, s: 1.1 },
  ];

  function draw(ctx, variant) {
    // Dusk sky and low sun.
    const sky = ctx.createLinearGradient(0, 0, 0, 365);
    sky.addColorStop(0, '#241a4d');
    sky.addColorStop(0.55, '#7a3b6e');
    sky.addColorStop(1, '#ff9a5c');
    rect(ctx, 0, 0, SCENE_W, 365, sky);
    for (const c of clouds) cloud(ctx, c.x, c.y, c.s, 'rgba(255, 190, 170, 0.55)');
    circle(ctx, 470, 250, 46, 'rgba(255, 214, 130, 0.35)');
    circle(ctx, 470, 250, 33, '#ffd682');
    circle(ctx, 470, 250, 33, 'rgba(255, 240, 190, 0.5)');
    for (const g of gulls) {
      if (variant.has('gull') && g.x === 330) continue;
      gull(ctx, g.x, g.y, g.s, '#2c2140');
    }
    // Sea, sun glitter and waves.
    const sea = ctx.createLinearGradient(0, 365, 0, SCENE_H);
    sea.addColorStop(0, '#1d3a5f');
    sea.addColorStop(1, '#0c1f3d');
    rect(ctx, 0, 365, SCENE_W, SCENE_H - 365, sea);
    for (let i = 0; i < 7; i += 1) {
      const y = 385 + i * 18;
      line(ctx, 448, y, 492, y, 'rgba(255, 214, 130, 0.35)', 3);
    }
    for (const w of waves) line(ctx, w.x, w.y, w.x + w.len, w.y, 'rgba(150, 200, 240, 0.35)', 2);
    // Lighthouse with striped tower, lamp room and beam.
    poly(ctx, [[58, 480], [72, 205], [118, 205], [132, 480]], '#f2ede2');
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(58, 480);
    ctx.lineTo(72, 205);
    ctx.lineTo(118, 205);
    ctx.lineTo(132, 480);
    ctx.closePath();
    ctx.clip();
    rect(ctx, 58, 250, 74, 34, '#d94f4f');
    rect(ctx, 58, 340, 74, 34, '#d94f4f');
    rect(ctx, 58, 430, 74, 34, '#d94f4f');
    ctx.restore();
    rect(ctx, 66, 186, 58, 22, '#2c2140');
    circle(ctx, 95, 197, 9, '#ffe9a8');
    poly(ctx, [[62, 186], [95, 162], [128, 186]], '#d94f4f');
    circle(ctx, 95, 158, 4, '#ffd166');
    // Tower window: warm light on the left, dark on the right.
    circle(ctx, 95, 330, 10, variant.has('window') ? '#3a3350' : '#ffe9a8');
    if (!variant.has('beam')) {
      const beam = ctx.createLinearGradient(124, 197, 420, 197);
      beam.addColorStop(0, 'rgba(255, 233, 168, 0.5)');
      beam.addColorStop(1, 'rgba(255, 233, 168, 0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(124, 188);
      ctx.lineTo(420, 150);
      ctx.lineTo(420, 245);
      ctx.lineTo(124, 206);
      ctx.closePath();
      ctx.fill();
    }
    // Rocks at the lighthouse base.
    ellipse(ctx, 55, 492, 34, 16, '#5c5468');
    ellipse(ctx, 135, 496, 30, 14, '#4a4356');
    // Dock with crates.
    rect(ctx, 150, 500, 210, 14, '#7a5230');
    rect(ctx, 150, 514, 210, 8, '#5f3d22');
    for (let i = 0; i < 5; i += 1) line(ctx, 168 + i * 40, 500, 168 + i * 40, 522, '#5f3d22', 2);
    line(ctx, 158, 500, 158, 545, '#4a3220', 6);
    line(ctx, 352, 500, 352, 545, '#4a3220', 6);
    rect(ctx, 196, 468, 34, 32, '#b07a3e');
    line(ctx, 196, 484, 230, 484, '#8a5a28', 3);
    rect(ctx, 238, 476, 28, 24, '#9a6a34');
    if (variant.has('crate')) {
      rect(ctx, 300, 472, 30, 28, '#b07a3e');
      line(ctx, 300, 486, 330, 486, '#8a5a28', 3);
    }
    // Sailboat with a flag, and a small boat.
    poly(ctx, [[380, 430], [392, 350], [404, 430]], '#f5efe0');
    poly(ctx, [[404, 430], [404, 360], [452, 430]], '#ffe9c9');
    line(ctx, 398, 350, 398, 428, '#3a2c1e', 3);
    poly(ctx, [[398, 350], [420, 356], [398, 363]], variant.has('flag') ? '#2ec4b6' : '#e63946');
    poly(ctx, [[372, 428], [462, 428], [448, 452], [386, 452]], '#8a4b2a');
    line(ctx, 380, 438, 454, 438, '#6b3418', 3);
    poly(ctx, [[512, 470], [520, 420], [528, 470]], '#e8e0cc');
    poly(ctx, [[528, 470], [528, 432], [560, 470]], '#ffd166');
    poly(ctx, [[506, 468], [566, 468], [556, 486], [516, 486]], '#6b4a2a');
    // Buoy: red on the left, yellow on the right.
    circle(ctx, 450, 505, 12, variant.has('buoy') ? '#ffd166' : '#e63946');
    poly(ctx, [[450, 493], [442, 478], [458, 478]], variant.has('buoy') ? '#ffd166' : '#e63946');
    circle(ctx, 450, 474, 3, '#fff3c4');
    // Jumping fish, present on the left only.
    if (!variant.has('fish')) {
      ctx.strokeStyle = '#9fc6e8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(180, 408, 16, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ellipse(ctx, 164, 396, 8, 4, '#9fc6e8');
      ellipse(ctx, 172, 424, 12, 3, 'rgba(200, 230, 255, 0.7)');
      ellipse(ctx, 190, 426, 8, 3, 'rgba(200, 230, 255, 0.5)');
    }
  }

  return {
    name: 'Harbor Dusk',
    subtitle: 'A sleepy fishing harbor at sunset',
    seconds: 180,
    diffs: [
      { id: 'gull', x: 330, y: 78, r: 28, label: 'a missing gull' },
      { id: 'beam', x: 260, y: 197, r: 34, label: 'the lighthouse beam' },
      { id: 'flag', x: 408, y: 356, r: 26, label: 'the boat flag colour' },
      { id: 'crate', x: 315, y: 486, r: 28, label: 'an extra crate' },
      { id: 'fish', x: 180, y: 408, r: 28, label: 'the jumping fish' },
      { id: 'window', x: 95, y: 330, r: 24, label: 'the lighthouse window' },
      { id: 'buoy', x: 450, y: 494, r: 26, label: 'the buoy colour' },
    ],
    draw,
  };
}

// ---------------------------------------------------------------------------
// Level 2 — Night Market. 9 differences, 150 seconds.
// ---------------------------------------------------------------------------
function buildMarket(seed) {
  const random = createRandom(seed);
  const stars = [];
  for (let i = 0; i < 40; i += 1) {
    stars.push({ x: rangeInt(random, 8, 600), y: rangeInt(random, 8, 150), s: rangeInt(random, 1, 3) });
  }
  const bulbs = [];
  for (let i = 0; i < 12; i += 1) {
    const t = i / 11;
    bulbs.push({
      x: 20 + t * 568,
      y: 96 + Math.sin(t * Math.PI) * 42,
      color: ['#ff6b6b', '#ffd166', '#7ee081', '#6cb4ff'][i % 4],
    });
  }
  const bunting = [];
  for (let i = 0; i < 9; i += 1) {
    const t = i / 8;
    bunting.push({
      x: 60 + t * 488,
      y: 168 + Math.sin(t * Math.PI) * 26,
      color: ['#e63946', '#ffd166', '#2ec4b6', '#ff8fa3'][i % 4],
    });
  }

  function awning(ctx, x, y, w, colors) {
    const stripes = colors.length;
    const sw = w / stripes;
    for (let i = 0; i < stripes; i += 1) rect(ctx, x + i * sw, y, sw, 26, colors[i]);
    ctx.beginPath();
    for (let i = 0; i < stripes; i += 1) {
      const cx = x + i * sw + sw / 2;
      ctx.moveTo(cx - sw / 2, y + 26);
      ctx.lineTo(cx, y + 40);
      ctx.lineTo(cx + sw / 2, y + 26);
    }
    ctx.fillStyle = colors[0];
    ctx.fill();
    rect(ctx, x, y + 26, w, 4, '#3a2c1e');
  }

  function lantern(ctx, x, y, color) {
    ellipse(ctx, x, y, 16, 20, color);
    rect(ctx, x - 8, y - 24, 16, 5, '#e8b64c');
    rect(ctx, x - 8, y + 19, 16, 5, '#e8b64c');
    line(ctx, x, y - 14, x, y + 14, 'rgba(0,0,0,0.25)', 2);
    line(ctx, x, y - 30, x, y - 24, '#c9a227', 2);
  }

  function draw(ctx, variant) {
    const sky = ctx.createLinearGradient(0, 0, 0, SCENE_H);
    sky.addColorStop(0, '#0d1030');
    sky.addColorStop(1, '#241a4d');
    rect(ctx, 0, 0, SCENE_W, SCENE_H, sky);
    for (const s of stars) circle(ctx, s.x, s.y, s.s, 'rgba(255,255,255,0.8)');
    // Moon with craters on the left; smooth on the right.
    circle(ctx, 520, 78, 34, 'rgba(255, 244, 200, 0.25)');
    circle(ctx, 520, 78, 28, '#fff3c4');
    if (!variant.has('crater')) {
      circle(ctx, 510, 70, 6, '#e8d9a0');
      circle(ctx, 530, 86, 4, '#e8d9a0');
      circle(ctx, 526, 66, 3, '#e8d9a0');
    }
    // String lights and bunting across the street.
    ctx.strokeStyle = '#3a2c1e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, 96);
    ctx.quadraticCurveTo(304, 190, 588, 96);
    ctx.stroke();
    for (const b of bulbs) {
      line(ctx, b.x, b.y - 6, b.x, b.y + 2, '#3a2c1e', 2);
      circle(ctx, b.x, b.y + 6, 6, b.color);
      circle(ctx, b.x, b.y + 6, 6, 'rgba(255,255,255,0.35)');
    }
    ctx.beginPath();
    ctx.moveTo(60, 168);
    ctx.quadraticCurveTo(304, 226, 548, 168);
    ctx.stroke();
    for (let i = 0; i < bunting.length; i += 1) {
      if (variant.has('bunting') && i === 4) continue;
      const f = bunting[i];
      poly(ctx, [[f.x - 11, f.y], [f.x + 11, f.y], [f.x, f.y + 22]], f.color);
    }
    // Paper lanterns hanging between the stalls.
    lantern(ctx, 214, 210, '#ff6b6b');
    if (!variant.has('lantern')) lantern(ctx, 372, 196, '#ffd166');
    lantern(ctx, 512, 216, '#ff8fa3');
    // Three stalls with striped awnings.
    awning(ctx, 36, 268, 168, ['#e63946', '#f5efe0', '#e63946', '#f5efe0', '#e63946', '#f5efe0']);
    rect(ctx, 44, 308, 152, 120, '#5f3d22');
    rect(ctx, 44, 308, 152, 10, '#7a5230');
    circle(ctx, 84, 350, 12, '#e63946');
    circle(ctx, 120, 350, 12, '#e63946');
    circle(ctx, 156, 350, 12, '#e63946');
    rect(ctx, 44, 372, 152, 56, '#3a2c1e');
    // Stall A sign: a star emblem on the left, a moon on the right.
    rect(ctx, 84, 236, 72, 26, '#f5efe0');
    if (variant.has('sign')) {
      ctx.strokeStyle = '#e63946';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(120, 249, 8, 0, Math.PI * 2);
      ctx.stroke();
      circle(ctx, 126, 245, 7, '#f5efe0');
    } else {
      sparkle(ctx, 120, 249, 9, '#e63946');
    }
    // Stall B: green awning, middle stripe yellow on the right.
    const bColors = ['#2a9d8f', '#f5efe0', variant.has('awning') ? '#ffd166' : '#2a9d8f', '#f5efe0', '#2a9d8f', '#f5efe0'];
    awning(ctx, 220, 268, 168, bColors);
    rect(ctx, 228, 308, 152, 120, '#5f3d22');
    rect(ctx, 228, 308, 152, 10, '#7a5230');
    ellipse(ctx, 268, 352, 18, 12, '#ffd166');
    ellipse(ctx, 308, 352, 18, 12, '#ff8fa3');
    ellipse(ctx, 348, 352, 18, 12, '#7ee081');
    rect(ctx, 228, 372, 152, 56, '#3a2c1e');
    // Stall C: blue awning and a fruit pile, apples or oranges.
    awning(ctx, 404, 268, 168, ['#4361ee', '#f5efe0', '#4361ee', '#f5efe0', '#4361ee', '#f5efe0']);
    rect(ctx, 412, 308, 152, 120, '#5f3d22');
    rect(ctx, 412, 308, 152, 10, '#7a5230');
    const fruit = variant.has('fruit') ? '#ff9f1c' : '#e63946';
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 4 - row; col += 1) {
        circle(ctx, 452 + col * 26 + row * 13, 366 - row * 20, 11, fruit);
      }
    }
    rect(ctx, 412, 372, 152, 56, '#3a2c1e');
    // Ground and the vendor cart with its steaming pot.
    rect(ctx, 0, 428, SCENE_W, SCENE_H - 428, '#2c2140');
    rect(ctx, 0, 428, SCENE_W, 6, '#3d3358');
    poly(ctx, [[258, 470], [350, 470], [342, 516], [266, 516]], '#8a5a28');
    rect(ctx, 252, 462, 104, 12, '#6b3418');
    circle(ctx, 278, 522, 12, '#3a2c1e');
    circle(ctx, 330, 522, 12, '#3a2c1e');
    circle(ctx, 278, 522, 5, '#c9a227');
    circle(ctx, 330, 522, 5, '#c9a227');
    ellipse(ctx, 304, 452, 26, 14, '#c0c0c0');
    rect(ctx, 282, 436, 44, 12, '#8a8a8a');
    if (!variant.has('steam')) {
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 3;
      for (const dx of [-12, 0, 12]) {
        ctx.beginPath();
        ctx.moveTo(304 + dx, 432);
        ctx.quadraticCurveTo(304 + dx + 6, 414, 304 + dx - 2, 398);
        ctx.stroke();
      }
    }
    // Balloons tied to the cart: one changes colour on the right.
    line(ctx, 352, 462, 372, 380, '#c9a227', 2);
    circle(ctx, 366, 356, 16, '#e63946');
    circle(ctx, 388, 372, 16, variant.has('balloon') ? '#7ee081' : '#4361ee');
    circle(ctx, 348, 378, 14, '#ffd166');
    // The market cat, sitting on a crate by stall A.
    rect(ctx, 96, 500, 40, 26, '#b07a3e');
    if (!variant.has('cat')) {
      ellipse(ctx, 116, 492, 16, 13, '#3a3a3a');
      circle(ctx, 116, 472, 11, '#3a3a3a');
      poly(ctx, [[108, 464], [111, 452], [116, 462]], '#3a3a3a');
      poly(ctx, [[120, 462], [125, 452], [128, 464]], '#3a3a3a');
      line(ctx, 130, 494, 148, 488, '#3a3a3a', 4);
      circle(ctx, 112, 470, 2, '#ffd166');
      circle(ctx, 120, 470, 2, '#ffd166');
    }
  }

  return {
    name: 'Night Market',
    subtitle: 'Lanterns, steam and a very busy cat',
    seconds: 150,
    diffs: [
      { id: 'crater', x: 520, y: 78, r: 32, label: 'the moon craters' },
      { id: 'lantern', x: 372, y: 196, r: 28, label: 'the missing lantern' },
      { id: 'bunting', x: 304, y: 196, r: 26, label: 'the missing bunting flag' },
      { id: 'awning', x: 304, y: 281, r: 26, label: 'the awning stripe colour' },
      { id: 'sign', x: 120, y: 249, r: 26, label: 'the stall sign emblem' },
      { id: 'fruit', x: 490, y: 340, r: 30, label: 'the fruit colour' },
      { id: 'steam', x: 304, y: 414, r: 28, label: 'the pot steam' },
      { id: 'balloon', x: 388, y: 372, r: 26, label: 'the balloon colour' },
      { id: 'cat', x: 118, y: 478, r: 30, label: 'the market cat' },
    ],
    draw,
  };
}

// ---------------------------------------------------------------------------
// Level 3 — Observatory Hill. 12 differences, 120 seconds.
// ---------------------------------------------------------------------------
function buildObservatory(seed) {
  const random = createRandom(seed);
  const stars = [];
  for (let i = 0; i < 90; i += 1) {
    stars.push({ x: rangeInt(random, 6, 602), y: rangeInt(random, 6, 330), s: rangeInt(random, 1, 3) });
  }
  const fireflies = [];
  for (let i = 0; i < 6; i += 1) {
    fireflies.push({ x: rangeInt(random, 40, 560), y: rangeInt(random, 440, 520) });
  }
  const dipper = [
    { x: 120, y: 70 },
    { x: 150, y: 58 },
    { x: 180, y: 62 },
    { x: 205, y: 84 },
    { x: 178, y: 104 },
    { x: 148, y: 100 },
    { x: 122, y: 96 },
  ];

  function draw(ctx, variant) {
    const sky = ctx.createLinearGradient(0, 0, 0, 420);
    sky.addColorStop(0, '#05081f');
    sky.addColorStop(1, '#141c44');
    rect(ctx, 0, 0, SCENE_W, 430, sky);
    for (const s of stars) circle(ctx, s.x, s.y, s.s, 'rgba(255,255,255,0.85)');
    // The Dipper constellation, one star missing on the right.
    ctx.strokeStyle = 'rgba(180, 200, 255, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    dipper.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
    dipper.forEach((p, i) => {
      if (variant.has('constellation') && i === 3) return;
      sparkle(ctx, p.x, p.y, 5, '#dfe8ff');
    });
    // Big moon with craters, and a satellite crossing the sky.
    circle(ctx, 480, 110, 52, 'rgba(255, 244, 200, 0.2)');
    circle(ctx, 480, 110, 42, '#fff3c4');
    if (!variant.has('mooncrater')) {
      circle(ctx, 464, 96, 8, '#e8d9a0');
      circle(ctx, 494, 122, 6, '#e8d9a0');
      circle(ctx, 496, 92, 4, '#e8d9a0');
    }
    if (!variant.has('satellite')) {
      line(ctx, 322, 62, 344, 76, '#c9d6ff', 2);
      rect(ctx, 326, 60, 14, 6, '#e8ecff');
      circle(ctx, 340, 72, 3, '#ff6b6b');
    }
    // Shooting star, present on the left only.
    if (!variant.has('shooting')) {
      const trail = ctx.createLinearGradient(560, 60, 480, 110);
      trail.addColorStop(0, 'rgba(255,255,255,0.95)');
      trail.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = trail;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(560, 60);
      ctx.lineTo(484, 108);
      ctx.stroke();
      sparkle(ctx, 560, 60, 6, '#ffffff');
    }
    // Hills and pines.
    const hill = ctx.createLinearGradient(0, 400, 0, SCENE_H);
    hill.addColorStop(0, '#16240f');
    hill.addColorStop(1, '#0a1408');
    ctx.fillStyle = hill;
    ctx.beginPath();
    ctx.moveTo(0, 430);
    ctx.quadraticCurveTo(150, 380, 304, 420);
    ctx.quadraticCurveTo(450, 455, 608, 410);
    ctx.lineTo(608, SCENE_H);
    ctx.lineTo(0, SCENE_H);
    ctx.closePath();
    ctx.fill();
    pine(ctx, 60, 470, 84, '#0d1f0a', true);
    pine(ctx, 120, 490, 64, '#0d1f0a', true);
    if (!variant.has('pine')) pine(ctx, 545, 478, 76, '#0d1f0a', true);
    pine(ctx, 500, 500, 56, '#0a1808', false);
    // The owl on a branch, present on the left only.
    line(ctx, 96, 330, 150, 322, '#4a3220', 5);
    if (!variant.has('owl')) {
      ellipse(ctx, 122, 312, 13, 16, '#8a6a4a');
      circle(ctx, 122, 292, 10, '#8a6a4a');
      circle(ctx, 118, 290, 3, '#ffd166');
      circle(ctx, 126, 290, 3, '#ffd166');
      poly(ctx, [[114, 284], [117, 276], [120, 284]], '#8a6a4a');
      poly(ctx, [[124, 284], [127, 276], [130, 284]], '#8a6a4a');
    }
    // Observatory dome, telescope slit and flag.
    ctx.fillStyle = '#e8e4d8';
    ctx.beginPath();
    ctx.arc(304, 400, 74, Math.PI, 0);
    ctx.fill();
    rect(ctx, 230, 400, 148, 60, '#d8d2c2');
    rect(ctx, 292, 330, 24, 70, '#2c2140');
    if (variant.has('telescope')) {
      ctx.save();
      ctx.translate(304, 340);
      ctx.rotate(0.5);
      rect(ctx, -6, -52, 12, 52, '#c9a227');
      ctx.restore();
    } else {
      rect(ctx, 298, 296, 12, 44, '#c9a227');
      circle(ctx, 304, 292, 7, '#8ecae6');
    }
    rect(ctx, 296, 428, 16, 32, '#4a3220');
    circle(ctx, 304, 420, 7, variant.has('doorlight') ? '#3a3350' : '#ffe9a8');
    if (!variant.has('flag')) {
      line(ctx, 304, 326, 304, 296, '#3a2c1e', 3);
      poly(ctx, [[304, 296], [330, 302], [304, 309]], '#e63946');
    }
    // Winding path with stepping stones and lamps.
    ctx.strokeStyle = '#8a7a5a';
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.moveTo(304, 470);
    ctx.quadraticCurveTo(280, 510, 304, 556);
    ctx.stroke();
    const stones = [
      { x: 302, y: 486 },
      { x: 290, y: 512 },
      { x: 306, y: 536 },
    ];
    stones.forEach((s, i) => {
      if (variant.has('stone') && i === 1) return;
      ellipse(ctx, s.x, s.y, 12, 7, '#b8a888');
    });
    line(ctx, 238, 520, 238, 486, '#3a2c1e', 4);
    circle(ctx, 238, 480, 10, variant.has('lamp') ? '#3a3350' : '#ffe9a8');
    line(ctx, 372, 524, 372, 490, '#3a2c1e', 4);
    circle(ctx, 372, 484, 10, '#ffe9a8');
    // Fireflies near the bushes, one fewer on the right.
    fireflies.forEach((f, i) => {
      if (variant.has('firefly') && i === 2) return;
      circle(ctx, f.x, f.y, 4, 'rgba(190, 255, 120, 0.35)');
      circle(ctx, f.x, f.y, 2, '#d8ff7a');
    });
    ellipse(ctx, 470, 520, 34, 16, '#0d1f0a');
    ellipse(ctx, 120, 528, 30, 14, '#0d1f0a');
  }

  const level = {
    name: 'Observatory Hill',
    subtitle: 'Stars, a dome and one sleepy owl',
    seconds: 120,
    diffs: [
      { id: 'shooting', x: 522, y: 84, r: 30, label: 'the shooting star' },
      { id: 'mooncrater', x: 480, y: 110, r: 34, label: 'the moon craters' },
      { id: 'satellite', x: 333, y: 68, r: 26, label: 'the satellite' },
      { id: 'constellation', x: 205, y: 84, r: 24, label: 'the missing constellation star' },
      { id: 'owl', x: 122, y: 300, r: 28, label: 'the owl' },
      { id: 'telescope', x: 304, y: 320, r: 28, label: 'the telescope angle' },
      { id: 'flag', x: 316, y: 302, r: 26, label: 'the dome flag' },
      { id: 'doorlight', x: 304, y: 420, r: 24, label: 'the dome door light' },
      { id: 'pine', x: 545, y: 440, r: 30, label: 'the missing pine' },
      { id: 'lamp', x: 238, y: 480, r: 24, label: 'the path lamp' },
      { id: 'stone', x: 290, y: 512, r: 24, label: 'the missing stepping stone' },
      { id: 'firefly', x: fireflies[2].x, y: fireflies[2].y, r: 24, label: 'the missing firefly' },
    ],
    draw,
  };
  return level;
}

/** Build all three levels from one seed. */
export function buildLevels(seed) {
  return [buildHarbor(seed + 11), buildMarket(seed + 23), buildObservatory(seed + 37)];
}
