// Synthesised sound effects, no audio files: a WebAudio oscillator per effect,
// created on the first user gesture so browsers allow it.
export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context === null) {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  }

  function tone(frequency, startAt, duration, type, volume) {
    const audio = ensure();
    if (audio === null || muted) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, audio.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(volume, audio.currentTime + startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + startAt + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(audio.currentTime + startAt);
    oscillator.stop(audio.currentTime + startAt + duration + 0.05);
  }

  return {
    unlock() {
      ensure();
    },
    get muted() {
      return muted;
    },
    toggleMuted() {
      muted = !muted;
      return muted;
    },
    click() {
      tone(520, 0, 0.06, 'sine', 0.08);
    },
    found() {
      tone(659, 0, 0.12, 'sine', 0.16);
      tone(880, 0.09, 0.18, 'sine', 0.16);
    },
    wrong() {
      tone(140, 0, 0.18, 'square', 0.1);
      tone(105, 0.05, 0.2, 'square', 0.08);
    },
    hint() {
      tone(440, 0, 0.1, 'triangle', 0.12);
      tone(587, 0.08, 0.14, 'triangle', 0.12);
    },
    levelClear() {
      [523, 659, 784, 1047].forEach((frequency, index) => {
        tone(frequency, index * 0.1, 0.22, 'sine', 0.15);
      });
    },
    win() {
      [523, 659, 784, 1047, 1319, 1568].forEach((frequency, index) => {
        tone(frequency, index * 0.11, 0.3, 'sine', 0.15);
      });
    },
    timeUp() {
      [392, 330, 262].forEach((frequency, index) => {
        tone(frequency, index * 0.16, 0.28, 'triangle', 0.14);
      });
    },
  };
}
