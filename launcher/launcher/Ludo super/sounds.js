// sounds.js - Sound effects for the game
export class GameSounds {
  constructor() {
    this.sounds = {};
    this.muted = false;
    this.initSounds();
  }

  initSounds() {
    // Try to create audio contexts for Web Audio API
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Web Audio API not supported, using HTML5 Audio');
      this.audioContext = null;
    }

    // Pre-create common sound effects
    this.createDiceSound();
    this.createMoveSound();
    this.createCaptureSound();
    this.createFinishSound();
    this.createWinSound();
    this.createBackgroundMusic();
  }

  // Create dice roll sound
  createDiceSound() {
    if (this.audioContext) {
      const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
      const channelData = buffer.getChannelData(0);
      
      for (let i = 0; i < buffer.length; i++) {
        channelData[i] = Math.random() * 2 - 1;
      }
      
      this.sounds.dice = buffer;
    } else {
      this.sounds.dice = this.createFallbackSound('dice');
    }
  }

  // Create pawn move sound
  createMoveSound() {
    if (this.audioContext) {
      const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
      const channelData = buffer.getChannelData(0);
      const frequency = 440;
      
      for (let i = 0; i < buffer.length; i++) {
        const t = i / this.audioContext.sampleRate;
        channelData[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 5);
      }
      
      this.sounds.move = buffer;
    } else {
      this.sounds.move = this.createFallbackSound('move');
    }
  }

  // Create capture sound
  createCaptureSound() {
    if (this.audioContext) {
      const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.8, this.audioContext.sampleRate);
      const channelData = buffer.getChannelData(0);
      const frequencies = [440, 554.37, 659.25]; // A, C#, E
      
      for (let i = 0; i < buffer.length; i++) {
        let sample = 0;
        const t = i / this.audioContext.sampleRate;
        
        frequencies.forEach((freq, index) => {
          sample += Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * (2 + index));
        });
        
        channelData[i] = sample / frequencies.length;
      }
      
      this.sounds.capture = buffer;
    } else {
      this.sounds.capture = this.createFallbackSound('capture');
    }
  }

  // Create finish sound
  createFinishSound() {
    if (this.audioContext) {
      const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 1, this.audioContext.sampleRate);
      const channelData = buffer.getChannelData(0);
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      for (let i = 0; i < buffer.length; i++) {
        let sample = 0;
        const t = i / this.audioContext.sampleRate;
        
        frequencies.forEach((freq, index) => {
          const delay = index * 0.05;
          if (t >= delay) {
            sample += Math.sin(2 * Math.PI * freq * (t - delay)) * Math.exp(-(t - delay) * 3);
          }
        });
        
        channelData[i] = sample * 0.5;
      }
      
      this.sounds.finish = buffer;
    } else {
      this.sounds.finish = this.createFallbackSound('finish');
    }
  }

  // Create win sound
  createWinSound() {
    if (this.audioContext) {
      const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 2, this.audioContext.sampleRate);
      const channelData = buffer.getChannelData(0);
      const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
      
      for (let i = 0; i < buffer.length; i++) {
        let sample = 0;
        const t = i / this.audioContext.sampleRate;
        
        melody.forEach((freq, index) => {
          const noteStart = index * 0.2;
          const noteEnd = noteStart + 0.15;
          
          if (t >= noteStart && t < noteEnd) {
            sample += Math.sin(2 * Math.PI * freq * (t - noteStart)) * 
                     Math.exp(-(t - noteStart) * 4) *
                     (1 - (t - noteStart) / 0.15);
          }
        });
        
        channelData[i] = sample * 0.7;
      }
      
      this.sounds.win = buffer;
    } else {
      this.sounds.win = this.createFallbackSound('win');
    }
  }

  // Create background music
  createBackgroundMusic() {
    // Simple background music
    if (this.audioContext) {
      const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
      const channelData = buffer.getChannelData(0);
      const bpm = 120;
      const beatDuration = 60 / bpm;
      
      for (let i = 0; i < buffer.length; i++) {
        const t = i / this.audioContext.sampleRate;
        const beat = Math.floor(t / beatDuration);
        const beatProgress = (t % beatDuration) / beatDuration;
        
        // Simple arpeggio pattern
        const baseFreq = 261.63; // C4
        const chord = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]; // C, E, G
        const noteIndex = beat % chord.length;
        const freq = chord[noteIndex];
        
        // Create a gentle pulsing sound
        const volume = 0.1 * (0.5 + 0.5 * Math.sin(2 * Math.PI * beatProgress));
        const env = Math.exp(-beatProgress * 8);
        
        channelData[i] = Math.sin(2 * Math.PI * freq * t) * volume * env;
      }
      
      this.sounds.background = buffer;
    } else {
      this.sounds.background = null;
    }
  }

  createFallbackSound(type) {
    // Create simple beep for fallback
    return type;
  }

  playSound(soundName, options = {}) {
    if (this.muted) return;
    
    if (this.audioContext && this.sounds[soundName] instanceof AudioBuffer) {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds[soundName];
      
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = options.volume || 0.5;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
      return source;
    } else {
      // Fallback to simple beep
      this.playFallbackSound(soundName);
    }
  }

  playFallbackSound(type) {
    if (this.muted) return;
    
    const audio = new Audio();
    const oscillator = audio.context ? audio.context.createOscillator() : null;
    
    if (oscillator) {
      let frequency = 440;
      let duration = 0.2;
      
      switch(type) {
        case 'dice':
          frequency = 200 + Math.random() * 600;
          duration = 0.5;
          break;
        case 'move':
          frequency = 440;
          duration = 0.1;
          break;
        case 'capture':
          frequency = 880;
          duration = 0.3;
          break;
        case 'finish':
          frequency = 1318.51;
          duration = 0.5;
          break;
        case 'win':
          frequency = 1046.50;
          duration = 1;
          break;
      }
      
      oscillator.frequency.value = frequency;
      oscillator.connect(audio.context.destination);
      oscillator.start();
      oscillator.stop(audio.context.currentTime + duration);
    } else {
      // Last resort - console beep
      console.log(`\x07`); // ASCII bell character
    }
  }

  startBackgroundMusic() {
    if (this.muted || !this.sounds.background) return;
    
    if (this.audioContext) {
      this.backgroundSource = this.audioContext.createBufferSource();
      this.backgroundSource.buffer = this.sounds.background;
      this.backgroundSource.loop = true;
      
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.1; // Very quiet background music
      
      this.backgroundSource.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      this.backgroundSource.start();
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundSource) {
      this.backgroundSource.stop();
      this.backgroundSource = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    
    if (this.muted) {
      this.stopBackgroundMusic();
    } else if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    return this.muted;
  }

  setVolume(volume) {
    // For future volume control
    this.volume = Math.max(0, Math.min(1, volume));
  }
}

