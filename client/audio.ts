let context: AudioContext | undefined;
let enabled = false;
export function setAudioEnabled(value: boolean) {
  enabled = value;
  if (!value) suspendAudio();
}
export function suspendAudio() {
  if (context?.state === 'running') void context.suspend().catch(() => {});
}
function start(render: (ctx: AudioContext, output: GainNode, time: number) => void) {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    const ctx = context;
    const resumed = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
    void resumed.then(() => {
      if (!enabled || document.hidden) return;
      const output = ctx.createGain();
      output.gain.value = 0.24;
      output.connect(ctx.destination);
      render(ctx, output, ctx.currentTime + 0.005);
      setTimeout(() => output.disconnect(), 450);
    }).catch(() => {});
  } catch { /* 音频能力不影响导航。 */ }
}
function noise(ctx: AudioContext, duration: number) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}
export function playSwitch() {
  start((ctx, output, t) => {
    const body = ctx.createOscillator(), envelope = ctx.createGain();
    body.type = 'triangle';
    body.frequency.setValueAtTime(140, t);
    body.frequency.exponentialRampToValueAtTime(38, t + 0.045);
    envelope.gain.setValueAtTime(0.0001, t);
    envelope.gain.linearRampToValueAtTime(0.55, t + 0.002);
    envelope.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    body.connect(envelope).connect(output);
    body.start(t); body.stop(t + 0.05);
    const click = noise(ctx, 0.009), filter = ctx.createBiquadFilter(), transient = ctx.createGain();
    filter.type = 'highpass'; filter.frequency.value = 2100;
    transient.gain.setValueAtTime(0.12, t);
    transient.gain.exponentialRampToValueAtTime(0.0001, t + 0.009);
    click.connect(filter).connect(transient).connect(output);
    click.start(t); click.stop(t + 0.01);
  });
}
export function playFlip() {
  start((ctx, output, t) => {
    const source = noise(ctx, 0.16), filter = ctx.createBiquadFilter(), envelope = ctx.createGain();
    filter.type = 'bandpass'; filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.exponentialRampToValueAtTime(320, t + 0.16);
    const curve = Float32Array.from({ length: 65 }, (_, i) => Math.sin(Math.PI * i / 64) * 0.38);
    envelope.gain.setValueCurveAtTime(curve, t, 0.16);
    source.connect(filter).connect(envelope).connect(output);
    source.start(t); source.stop(t + 0.16);
  });
}
export function playOpen() {
  start((ctx, output, t) => {
    [196, 294].forEach((frequency, i) => {
      const tone = ctx.createOscillator(), envelope = ctx.createGain(), filter = ctx.createBiquadFilter();
      tone.type = i ? 'sine' : 'triangle'; tone.frequency.value = frequency;
      filter.type = 'lowpass'; filter.frequency.value = 680;
      envelope.gain.setValueAtTime(0.0001, t);
      envelope.gain.linearRampToValueAtTime(0.19, t + 0.012);
      envelope.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
      tone.connect(filter).connect(envelope).connect(output);
      tone.start(t); tone.stop(t + 0.27);
    });
  });
}

