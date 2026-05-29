/**
 * Utility para reproducir un sonido de notificación usando Web Audio API
 * Sonido agradable con dos notas
 */

let audioContext: (AudioContext & { state?: string }) | null = null;

/**
 * Obtiene o crea el contexto de audio
 */
const getAudioContext = (): (AudioContext & { state?: string }) | null => {
  if (!audioContext) {
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }
  return audioContext;
};

/**
 * Reproduce un sonido agradable de notificación (dos notas)
 */
export const playNotificationSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume el contexto de audio si está suspendido
    if ((ctx as any).state === 'suspended') {
      (ctx as any).resume();
    }

    const now = ctx.currentTime;
    const noteDuration = 0.2;
    const gap = 0.05;

    // Primera nota (más baja)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 523.25; // Do5
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + noteDuration);
    osc1.start(now);
    osc1.stop(now + noteDuration);

    // Segunda nota (más alta)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 659.25; // Mi5
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.25, now + noteDuration + gap);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + noteDuration * 2 + gap);
    osc2.start(now + noteDuration + gap);
    osc2.stop(now + noteDuration * 2 + gap);
  } catch (error) {
    console.warn('No se pudo reproducir el sonido de notificación:', error);
  }
};
