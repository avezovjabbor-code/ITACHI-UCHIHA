// Web Audio API Synthesizer for Naruto: Shinobi Clash
// Generates authentic ninja battle SFX and dynamic Taiko/Flute battle soundtrack

class SoundController {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.musicPlaying = false;
        this.musicInterval = null;
        this.volume = 0.7;
        this.sfxVolume = 0.8;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMute(muted) {
        this.isMuted = muted;
        if (muted && this.musicPlaying) {
            this.stopBGM();
        } else if (!muted && !this.musicPlaying) {
            this.startBGM();
        }
    }

    // --- SFX GENERATORS ---

    // Kunai throw / whoosh
    playWhoosh() {
        if (this.isMuted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);

        gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Physical punch / kick hit
    playHit(isHeavy = false) {
        if (this.isMuted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Punch impact oscillator
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isHeavy ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(isHeavy ? 180 : 250, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);

        // Noise buffer for snap impact
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime((isHeavy ? 0.6 : 0.4) * this.sfxVolume, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        gain.gain.setValueAtTime((isHeavy ? 0.7 : 0.5) * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.2);
        noise.stop(now + 0.1);
    }

    // Metal clank / sword or kunai clash
    playClash() {
        if (this.isMuted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const freqs = [1200, 1850, 2400];
        freqs.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 0.25);

            gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.25);
        });
    }

    // Kawarimi (Substitution Log) Poof!
    playKawarimi() {
        if (this.isMuted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Wood impact
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.15);
        gain.gain.setValueAtTime(0.5 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);

        // Smoke puff noise
        const bufferSize = ctx.sampleRate * 0.25;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.25);
    }

    // Chakra charge hum
    playChakraCharge() {
        if (this.isMuted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.3);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(1200, now + 0.3);

        gain.gain.setValueAtTime(0.02 * this.sfxVolume, now);
        gain.gain.linearRampToValueAtTime(0.25 * this.sfxVolume, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Rasengan spinning vortex sound
    playRasengan() {
        if (this.isMuted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // High spinning pitch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.8);

        // Low energetic resonance
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(80, now);
        subOsc.frequency.linearRampToValueAtTime(140, now + 0.4);
        subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.8);

        gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

        subGain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

        osc.connect(gain);
        gain.connect(ctx.destination);
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);

        osc.start(now);
        subOsc.start(now);
        osc.stop(now + 0.85);
        subOsc.stop(now + 0.85);
    }

    // Chidori / Lightning blade crackle
    playChidori() {
        if (this.isMuted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Thousand birds high-frequency zap
        for (let i = 0; i < 5; i++) {
            const delay = i * 0.07;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1500 + Math.random() * 800, now + delay);
            osc.frequency.exponentialRampToValueAtTime(400, now + delay + 0.1);

            gain.gain.setValueAtTime(0.2 * this.sfxVolume, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.1);
        }
    }

    // Fireball roar
    playFireball() {
        if (this.isMuted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const bufferSize = ctx.sampleRate * 0.6;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.6));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.linearRampToValueAtTime(1400, now + 0.2);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.6);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.6);
    }

    // Ultimate Jutsu awakening thunder & gong
    playUltimateAwakening() {
        if (this.isMuted) return;
        this.init();
        const ctx = this.ctx;
        const now = ctx.currentTime;

        // Heavy Japanese temple gong / war drum
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 1.2);

        gain.gain.setValueAtTime(0.8 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);

        // Shimmering overtone
        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chime.type = 'triangle';
        chime.frequency.setValueAtTime(880, now);
        chime.frequency.exponentialRampToValueAtTime(440, now + 1.0);
        chimeGain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

        chime.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chime.start(now);
        chime.stop(now + 1.0);
    }

    // Victory fanfare
    playVictory() {
        if (this.isMuted) return;
        this.init();
        const ctx = this.ctx;
        const notes = [440, 554, 659, 880, 1108]; // A major pentatonic
        notes.forEach((f, idx) => {
            const now = ctx.currentTime + idx * 0.16;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now);
            gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.5);
        });
    }

    // --- PROCEDURAL JAPANESE BATTLE BGM (Taiko Drums & Shakuhachi / Koto Synth) ---
    startBGM() {
        if (this.isMuted || this.musicPlaying) return;
        this.init();
        this.musicPlaying = true;

        const pentatonic = [220, 246.94, 261.63, 329.63, 349.23, 440, 493.88, 523.25, 659.25]; // Hirajoshi ninja scale!
        let step = 0;

        this.musicInterval = setInterval(() => {
            if (!this.musicPlaying || this.isMuted) return;
            const now = this.ctx.currentTime;

            // 1. Taiko Drum pulse on beats 0, 2, 4, 6 (160 BPM / 8-step pattern)
            if (step % 2 === 0) {
                const isHeavy = step === 0 || step === 4;
                const drumOsc = this.ctx.createOscillator();
                const drumGain = this.ctx.createGain();
                drumOsc.type = 'sine';
                drumOsc.frequency.setValueAtTime(isHeavy ? 95 : 120, now);
                drumOsc.frequency.exponentialRampToValueAtTime(35, now + 0.2);

                drumGain.gain.setValueAtTime((isHeavy ? 0.35 : 0.2) * this.volume, now);
                drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

                drumOsc.connect(drumGain);
                drumGain.connect(this.ctx.destination);
                drumOsc.start(now);
                drumOsc.stop(now + 0.25);
            }

            // 2. Koto / Shakuhachi lead melody on key steps
            if (step % 2 === 1 || Math.random() > 0.4) {
                const note = pentatonic[Math.floor(Math.random() * pentatonic.length)];
                const fluteOsc = this.ctx.createOscillator();
                const fluteGain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                fluteOsc.type = 'triangle';
                fluteOsc.frequency.setValueAtTime(note, now);
                // Subtle pitch bend
                fluteOsc.frequency.linearRampToValueAtTime(note * (1 + (Math.random() * 0.04 - 0.02)), now + 0.2);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1400, now);

                fluteGain.gain.setValueAtTime(0.08 * this.volume, now);
                fluteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

                fluteOsc.connect(filter);
                filter.connect(fluteGain);
                fluteGain.connect(this.ctx.destination);

                fluteOsc.start(now);
                fluteOsc.stop(now + 0.38);
            }

            step = (step + 1) % 8;
        }, 180);
    }

    stopBGM() {
        this.musicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

// Global sound manager
window.soundCtrl = new SoundController();
