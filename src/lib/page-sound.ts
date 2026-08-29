/**
 * A tiny synthesised page-flick sound. No audio asset, no dependency: a short
 * burst of filtered noise with a fast decay, which reads as paper sliding.
 *
 * Only ever called from a user gesture (a swipe or a tap), so the browser
 * autoplay policy is satisfied. Silently no-ops where WebAudio is missing.
 */

let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;

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
  const len = Math.floor(c.sampleRate * 0.35);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) {
    // Slightly correlated noise sounds more like paper than pure white noise.
    data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 0.6;
  }
  noise = buf;
  return buf;
}

/**
 * Play the flick.
 * @param strength 0..1 — how firm the turn was, scales brightness and volume.
 */
export function playPageFlick(strength = 1) {
  const c = audio();
  if (!c) return;
  try {
    const s = Math.max(0.25, Math.min(1, strength));
    const now = c.currentTime;

    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c);
    src.playbackRate.value = 0.9 + s * 0.5;

    // Band-pass sweep: the paper "shhk" rises then closes off.
    const band = c.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.9;
    band.frequency.setValueAtTime(900, now);
    band.frequency.exponentialRampToValueAtTime(2600 + s * 1800, now + 0.09);
    band.frequency.exponentialRampToValueAtTime(700, now + 0.26);

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05 * s, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    src.connect(band).connect(gain).connect(c.destination);
    src.start(now);
    src.stop(now + 0.32);
  } catch {
    /* audio is a flourish, never a failure */
  }
}
