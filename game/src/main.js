// Boot and the one loop for Twin Stars: input is read every frame, the timer
// advances in fixed 1/60 s steps, and the renderer paints what is there.
//
// ?seed=N fixes the scenes' decoration. ?shot=start|play|play2|win (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { STEP } from './config.js';
import { createWorld } from './world.js';
import { createRenderer } from './render.js';
import { createInput, handleInput } from './input.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(seed);
const renderer = createRenderer(canvas);
const input = createInput(canvas);
const audio = createAudio();
const sounds = {
  click: () => audio.click(),
  found: () => audio.found(),
  wrong: () => audio.wrong(),
  hint: () => audio.hint(),
  levelClear: () => audio.levelClear(),
  win: () => audio.win(),
  timeUp: () => audio.timeUp(),
};

function playSound(name) {
  if (name !== null && sounds[name] !== undefined) sounds[name]();
}

function announce(message) {
  status.textContent = message;
}

function runShot(name) {
  const screen = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, performance.now() / 1000);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  announce(`Twin Stars, ${screen} scene.`);
  requestAnimationFrame(paint);
}

function runGame() {
  let accumulator = 0;
  let last = performance.now();
  let lastScreen = world.state.screen;
  let lastFound = 0;

  function frame(nowMs) {
    requestAnimationFrame(frame);
    const now = nowMs / 1000;
    const sound = handleInput(world, input, audio, now);
    playSound(sound);
    const stepSeconds = Math.min((nowMs - last) / 1000, 0.25);
    last = nowMs;
    if (world.state.screen === 'play') {
      accumulator += stepSeconds;
      while (accumulator >= STEP) {
        world.tick(STEP, now);
        accumulator -= STEP;
        if (world.state.screen !== 'play') break;
      }
    } else {
      accumulator = 0;
    }
    // Screen readers (and anyone watching the page's text) hear the changes.
    if (world.state.screen !== lastScreen) {
      lastScreen = world.state.screen;
      if (lastScreen === 'play') announce(`Playing level ${world.state.levelIndex + 1}. Find the differences.`);
      else if (lastScreen === 'levelDone') announce(world.state.message);
      else if (lastScreen === 'over') announce(`Time's up. Score ${world.state.score}.`);
      else if (lastScreen === 'win') announce(`You found them all! Score ${world.state.totalScore}.`);
      else if (lastScreen === 'paused') announce('Paused.');
      if (lastScreen === 'over') playSound('timeUp');
    }
    if (world.state.found.size !== lastFound) {
      lastFound = world.state.found.size;
      const level = world.level();
      announce(`Found ${lastFound} of ${level.diffs.length}. ${level.diffs.length - lastFound} remain.`);
    }
    renderer.draw(world.state, now);
  }

  announce('Twin Stars. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
