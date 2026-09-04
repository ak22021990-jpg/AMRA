import { useRef, useCallback, useEffect } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';

export type Soundscape = 'silence' | 'rain' | 'glide';

// Creates filtered noise buffers for ambient soundscapes
function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function useAmbientSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ source?: AudioBufferSourceNode; gain?: GainNode; filters: BiquadFilterNode[] }>({ filters: [] });
  const activeSoundscape = useRef<Soundscape>('silence');
  const audioEnabled = useAssessmentStore(s => s.audioEnabled);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const stopCurrent = useCallback(() => {
    const nodes = nodesRef.current;
    if (nodes.source) {
      try { nodes.source.stop(); } catch {}
      nodes.source.disconnect();
    }
    if (nodes.gain) {
      nodes.gain.disconnect();
    }
    nodes.filters.forEach(f => f.disconnect());
    nodes.filters = [];
    nodes.source = undefined;
    nodes.gain = undefined;
  }, []);

  const playRain = useCallback(() => {
    const ctx = getCtx();
    const noise = createNoiseBuffer(ctx, 4);
    const source = ctx.createBufferSource();
    source.buffer = noise;
    source.loop = true;

    // Lowpass for muffled rain-on-roof
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 800;
    lowpass.Q.value = 0.5;

    // Bandpass for rain texture
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 3000;
    bandpass.Q.value = 0.3;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(lowpass);
    lowpass.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    source.start();
    // Fade in over 2s
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2);

    nodesRef.current = { source, gain, filters: [lowpass, bandpass] };
  }, [getCtx]);

  const playGlide = useCallback(() => {
    const ctx = getCtx();

    // Low drone oscillator
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 80;

    // Higher harmonic
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 160;

    // Very subtle LFO for movement
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);

    const gain = ctx.createGain();
    gain.gain.value = 0;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    lfo.start();
    // Fade in
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2);

    // Store all nodes for cleanup
    const nodes = nodesRef.current;
    nodes.source = undefined; // not a buffer source
    nodes.gain = gain;
    nodes.filters = [osc1 as unknown as BiquadFilterNode, osc2 as unknown as BiquadFilterNode, lfo as unknown as BiquadFilterNode];
    // Hack: store oscillators so we can stop them
    (nodes as { oscillators?: OscillatorNode[] }).oscillators = [osc1, osc2, lfo];
  }, [getCtx]);

  const setSoundscape = useCallback((soundscape: Soundscape) => {
    if (!audioEnabled || soundscape === activeSoundscape.current) return;

    stopCurrent();
    activeSoundscape.current = soundscape;

    switch (soundscape) {
      case 'rain': playRain(); break;
      case 'glide': playGlide(); break;
      case 'silence': break;
    }
  }, [audioEnabled, stopCurrent, playRain, playGlide]);

  // Stop all when audio gets disabled
  useEffect(() => {
    if (!audioEnabled) {
      stopCurrent();
      activeSoundscape.current = 'silence';
    }
  }, [audioEnabled, stopCurrent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrent();
      if (ctxRef.current) {
        ctxRef.current.close();
      }
    };
  }, [stopCurrent]);

  return { setSoundscape };
}
