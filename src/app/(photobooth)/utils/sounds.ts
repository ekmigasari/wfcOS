import { soundVolume, soundVolumeLevel } from "@/infrastructure/lib/utils";

// Photobox sounds are synthesized with Web Audio so no extra audio files are needed

let audioContext: AudioContext | null = null;

const getContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (soundVolumeLevel === "mute" || soundVolume <= 0) return null;
  if (!audioContext) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  }
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
};

const createNoiseBuffer = (ctx: AudioContext, seconds: number) => {
  const buffer = ctx.createBuffer(
    1,
    Math.ceil(ctx.sampleRate * seconds),
    ctx.sampleRate
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
};

export const playCountdownBeep = (final = false) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = final ? 1320 : 880;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.25 * soundVolume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.16);
};

export const playShutter = () => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Two quick filtered noise bursts: mirror flip up + shutter close
  [0, 0.07].forEach((offset, i) => {
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx, 0.08);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = i === 0 ? 2400 : 1600;
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    const start = now + offset;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.9 * soundVolume, start + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.06);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(start);
    source.stop(start + 0.08);
  });
};

// --- Print sound: a soft lofi café moment --------------------------------

const midiToHz = (note: number) => 440 * 2 ** ((note - 69) / 12);

// Vinyl crackle: sparse clicks over a faint hiss
const createCrackleBuffer = (ctx: AudioContext, seconds: number) => {
  const buffer = ctx.createBuffer(
    1,
    Math.ceil(ctx.sampleRate * seconds),
    ctx.sampleRate
  );
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const hiss = (Math.random() * 2 - 1) * 0.04;
    const click = Math.random() < 0.0004 ? (Math.random() * 2 - 1) * 0.9 : 0;
    data[i] = hiss + click;
  }
  return buffer;
};

// Warm electric-piano style note with a gentle strike and long fade
const playKeysNote = (
  ctx: AudioContext,
  destination: AudioNode,
  wobble: AudioNode,
  midi: number,
  start: number,
  length: number,
  level: number
) => {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(level, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(level * 0.45, start + 0.6);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  gain.connect(destination);

  // Fundamental + soft octave partial, slightly detuned for a dusty tape feel
  [
    { type: "sine" as const, ratio: 1, amount: 1, detune: -4 },
    { type: "triangle" as const, ratio: 2, amount: 0.18, detune: 5 },
  ].forEach(({ type, ratio, amount, detune }) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = midiToHz(midi) * ratio;
    osc.detune.value = detune;
    wobble.connect(osc.detune);
    const partial = ctx.createGain();
    partial.gain.value = amount;
    osc.connect(partial).connect(gain);
    osc.start(start);
    osc.stop(start + length + 0.05);
  });
};

// Little coffee drip "bloop"
const playDrip = (
  ctx: AudioContext,
  destination: AudioNode,
  start: number,
  level: number
) => {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(1200, start);
  osc.frequency.exponentialRampToValueAtTime(380, start + 0.09);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(level, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
  osc.connect(gain).connect(destination);
  osc.start(start);
  osc.stop(start + 0.16);
};

// Spoon tapping a ceramic cup: a few inharmonic, fast-decaying partials
const playCupClink = (
  ctx: AudioContext,
  destination: AudioNode,
  start: number,
  level: number
) => {
  [
    [2490, 1],
    [3720, 0.55],
    [5310, 0.25],
  ].forEach(([freq, amount]) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(level * amount, start + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.7 / (1 + amount));
    osc.connect(gain).connect(destination);
    osc.start(start);
    osc.stop(start + 0.8);
  });
};

/**
 * Soft lofi coffee jingle that plays while the print slides out:
 * vinyl crackle, a gentle espresso steam, coffee drips, two mellow
 * chords (Fmaj9 → Em7) and a cup clink when the print is ready.
 */
export const playPrintJingle = (duration: number) => {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime + 0.02;
  const end = now + duration;
  const volume = soundVolume;

  // Warm master bus: everything goes through a lowpass for the muffled lofi tone
  const master = ctx.createGain();
  master.gain.value = 0.9 * volume;
  const warmth = ctx.createBiquadFilter();
  warmth.type = "lowpass";
  warmth.frequency.value = 2200;
  warmth.Q.value = 0.5;
  warmth.connect(master).connect(ctx.destination);

  // Slow tape wobble shared by all piano notes (in cents)
  const wobbleLfo = ctx.createOscillator();
  wobbleLfo.frequency.value = 0.7;
  const wobble = ctx.createGain();
  wobble.gain.value = 9;
  wobbleLfo.connect(wobble);
  wobbleLfo.start(now);
  wobbleLfo.stop(end + 1.6);

  // Vinyl crackle bed
  const crackle = ctx.createBufferSource();
  crackle.buffer = createCrackleBuffer(ctx, duration + 1.5);
  const crackleTone = ctx.createBiquadFilter();
  crackleTone.type = "bandpass";
  crackleTone.frequency.value = 1800;
  crackleTone.Q.value = 0.4;
  const crackleGain = ctx.createGain();
  crackleGain.gain.setValueAtTime(0.0001, now);
  crackleGain.gain.exponentialRampToValueAtTime(0.35, now + 0.3);
  crackleGain.gain.setValueAtTime(0.35, end);
  crackleGain.gain.exponentialRampToValueAtTime(0.0001, end + 1.4);
  crackle.connect(crackleTone).connect(crackleGain).connect(warmth);
  crackle.start(now);
  crackle.stop(end + 1.5);

  // Gentle espresso steam that swells and settles
  const steam = ctx.createBufferSource();
  steam.buffer = createNoiseBuffer(ctx, duration);
  const steamTone = ctx.createBiquadFilter();
  steamTone.type = "bandpass";
  steamTone.frequency.value = 1100;
  steamTone.Q.value = 0.8;
  const gurgle = ctx.createOscillator();
  gurgle.frequency.value = 3.5;
  const gurgleDepth = ctx.createGain();
  gurgleDepth.gain.value = 250;
  gurgle.connect(gurgleDepth).connect(steamTone.frequency);
  const steamGain = ctx.createGain();
  steamGain.gain.setValueAtTime(0.0001, now);
  steamGain.gain.exponentialRampToValueAtTime(0.07, now + duration * 0.35);
  steamGain.gain.exponentialRampToValueAtTime(0.0001, end);
  steam.connect(steamTone).connect(steamGain).connect(warmth);
  [steam, gurgle].forEach((node) => {
    node.start(now);
    node.stop(end);
  });

  // Coffee drips, loosely timed
  for (let t = 0.5; t < duration - 0.6; t += 0.35 + Math.random() * 0.35) {
    playDrip(ctx, warmth, now + t, 0.18);
  }

  // Two lightly strummed chords
  const fmaj9 = [53, 57, 60, 64, 67]; // F3 A3 C4 E4 G4
  const em7 = [52, 55, 59, 62, 66]; // E3 G3 B3 D4 F#4
  const keys = ctx.createGain();
  keys.gain.value = 0.55;
  keys.connect(warmth);
  fmaj9.forEach((note, i) =>
    playKeysNote(
      ctx,
      keys,
      wobble,
      note,
      now + 0.05 + i * 0.045,
      duration * 0.55,
      0.12
    )
  );
  em7.forEach((note, i) =>
    playKeysNote(
      ctx,
      keys,
      wobble,
      note,
      now + duration * 0.5 + i * 0.045,
      duration * 0.5 + 1.4,
      0.11
    )
  );

  // Cup clink when the print is ready (skips the lowpass so it sparkles)
  const clinkBus = ctx.createGain();
  clinkBus.gain.value = 0.75 * volume;
  clinkBus.connect(ctx.destination);
  playCupClink(ctx, clinkBus, end - 0.02, 0.18);
};
