/**
 * A soft synthesised paper rustle for page turns. No audio asset, no
 * dependency: a very short, heavily low-passed noise brush, kept quiet enough
 * to feel like paper rather than static.
 *
 * Only ever called from a user gesture, so autoplay policy is satisfied.
 * Silently no-ops where WebAudio is missing.
 */

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let last = 0;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function noiseBuffer(c: AudioContext): AudioBuffer {
  if (noise) return noise;
  const len = Math.floor(c.sampleRate * 0.2);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  let prev = 0;
  for (let i = 0; i < len; i += 1) {
    // Smoothed (brown-ish) noise: far softer than white noise.
    prev = prev * 0.86 + (Math.random() * 2 - 1) * 0.14;
    data[i] = prev * (1 - i / len) ** 1.4;
  }
  noise = buf;
  return buf;
}

/**
 * Play one paper brush.
 * @param strength 0..1 — how firm the turn was; scales volume very gently.
 */
export function playPageFlick(strength = 1) {
  const c = audio();
  if (!c) return;
  // Never machine-gun the sound during a drag.
  if (c.currentTime - last < 0.12) return;
  last = c.currentTime;
  try {
    const s = Math.max(0.3, Math.min(1, strength));
    const now = c.currentTime;

    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c);
    src.playbackRate.value = 1.15;

    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(2200, now);
    lp.frequency.exponentialRampToValueAtTime(700, now + 0.16);

    const hp = c.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 320;

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.022 * s, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    src.connect(hp).connect(lp).connect(gain).connect(c.destination);
    src.start(now);
    src.stop(now + 0.2);
  } catch {
    /* audio is a flourish, never a failure */
  }
}
