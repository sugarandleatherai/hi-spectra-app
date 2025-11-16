/**
 * Audio Management Module
 *
 * Handles:
 * - Microphone access and audio recording
 * - Wake word detection
 * - Audio visualization (waveform)
 * - Speech recognition integration
 *
 * @module audio
 * @author Hi-Spectra Team
 * @version 1.0.0
 */

/**
 * AudioManager Class
 * Manages all audio-related functionality for the voice assistant
 */
class AudioManager {
  constructor() {
    // Audio context for processing
    this.audioContext = null;
    this.mediaStream = null;
    this.audioAnalyzer = null;
    this.mediaRecorder = null;

    // Wake word detection
    this.wakeWordActive = true;
    this.wakeWords = ['hey spectra', 'high spectra'];
    this.isListening = false;

    // Audio data
    this.audioChunks = [];

    // Visualization
    this.canvas = document.getElementById('waveform');
    this.canvasContext = this.canvas ? this.canvas.getContext('2d') : null;
    this.animationId = null;

    // Speech Recognition (Web Speech API)
    this.recognition = null;
    this.initializeSpeechRecognition();
  }

  /**
   * Initialize Web Speech API for speech recognition
   * This provides built-in speech-to-text in Chromium-based browsers
   */
  initializeSpeechRecognition() {
    // Check if Web Speech API is available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech API not available');
      return;
    }

    this.recognition = new SpeechRecognition();

    // Configure recognition
    this.recognition.continuous = true;  // Keep listening
    this.recognition.interimResults = true;  // Get partial results
    this.recognition.lang = 'en-US';

    // Handle recognition results
    this.recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const result = event.results[last];
      const transcript = result[0].transcript.toLowerCase().trim();
      const isFinal = result.isFinal;

      console.log('Speech recognition:', transcript, isFinal ? '(final)' : '(interim)');

      // Check for wake word if wake word mode is active
      if (this.wakeWordActive && !this.isListening) {
        if (this.containsWakeWord(transcript)) {
          console.log('Wake word detected!');
          this.onWakeWordDetected(transcript);
        }
      }
      // Process command if actively listening
      else if (this.isListening && isFinal) {
        this.onSpeechRecognized(transcript);
      }
    };

    // Handle recognition errors
    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);

      // Restart recognition if it stops unexpectedly
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        setTimeout(() => {
          if (this.wakeWordActive) {
            this.startContinuousListening();
          }
        }, 1000);
      }
    };

    // Handle recognition end
    this.recognition.onend = () => {
      console.log('Speech recognition ended');

      // Restart if wake word is still active
      if (this.wakeWordActive) {
        this.startContinuousListening();
      }
    };
  }

  /**
   * Check if transcript contains any wake word
   * @param {string} transcript - Speech recognition transcript
   * @returns {boolean} True if wake word is detected
   */
  containsWakeWord(transcript) {
    return this.wakeWords.some(word => transcript.includes(word));
  }

  /**
   * Remove wake word from transcript to get the actual command
   * @param {string} transcript - Full transcript
   * @returns {string} Command without wake word
   */
  removeWakeWord(transcript) {
    let command = transcript;
    for (const word of this.wakeWords) {
      command = command.replace(word, '').trim();
    }
    return command;
  }

  /**
   * Initialize audio context and get microphone access
   */
  async initialize() {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create analyzer for visualization
      this.audioAnalyzer = this.audioContext.createAnalyser();
      this.audioAnalyzer.fftSize = 2048;

      // Connect microphone to analyzer
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.audioAnalyzer);

      // Start visualization
      this.visualize();

      console.log('Audio initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }

  /**
   * Start continuous listening for wake word
   */
  startContinuousListening() {
    if (!this.recognition) {
      console.warn('Speech recognition not available');
      return;
    }

    try {
      this.recognition.start();
      console.log('Started continuous listening for wake word');
    } catch (error) {
      // Recognition might already be started
      console.log('Recognition already active');
    }
  }

  /**
   * Stop continuous listening
   */
  stopContinuousListening() {
    if (this.recognition) {
      this.recognition.stop();
      console.log('Stopped continuous listening');
    }
  }

  /**
   * Start recording audio for command recognition
   */
  startRecording() {
    if (!this.mediaStream) {
      console.error('No media stream available');
      return;
    }

    // Clear previous audio chunks
    this.audioChunks = [];

    // Create media recorder
    this.mediaRecorder = new MediaRecorder(this.mediaStream);

    // Collect audio data
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    // Start recording
    this.mediaRecorder.start();
    this.isListening = true;

    console.log('Started recording');
  }

  /**
   * Stop recording audio
   */
  stopRecording() {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
      return;
    }

    this.mediaRecorder.stop();
    this.isListening = false;

    console.log('Stopped recording');
  }

  /**
   * Visualize audio waveform on canvas
   */
  visualize() {
    if (!this.audioAnalyzer || !this.canvasContext) {
      return;
    }

    const bufferLength = this.audioAnalyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      this.animationId = requestAnimationFrame(draw);

      // Get waveform data
      this.audioAnalyzer.getByteTimeDomainData(dataArray);

      // Clear canvas
      this.canvasContext.fillStyle = '#16213e';
      this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw waveform
      this.canvasContext.lineWidth = 2;
      this.canvasContext.strokeStyle = this.isListening ? '#e94560' : '#533483';
      this.canvasContext.beginPath();

      const sliceWidth = this.canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * this.canvas.height) / 2;

        if (i === 0) {
          this.canvasContext.moveTo(x, y);
        } else {
          this.canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      this.canvasContext.lineTo(this.canvas.width, this.canvas.height / 2);
      this.canvasContext.stroke();
    };

    draw();
  }

  /**
   * Toggle wake word detection on/off
   * @param {boolean} enabled - Whether to enable wake word
   */
  toggleWakeWord(enabled) {
    this.wakeWordActive = enabled;

    if (enabled) {
      this.startContinuousListening();
    } else {
      this.stopContinuousListening();
    }

    console.log(`Wake word ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Handle wake word detection
   * Override this in app.js to customize behavior
   * @param {string} transcript - Full transcript including wake word
   */
  onWakeWordDetected(transcript) {
    // This will be overridden in app.js
    console.log('Wake word detected (override this method)');
  }

  /**
   * Handle speech recognition result
   * Override this in app.js to customize behavior
   * @param {string} transcript - Recognized speech
   */
  onSpeechRecognized(transcript) {
    // This will be overridden in app.js
    console.log('Speech recognized (override this method)');
  }

  /**
   * Cleanup audio resources
   */
  cleanup() {
    // Stop visualization
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Stop recognition
    this.stopContinuousListening();

    // Stop recording
    this.stopRecording();

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
    }

    // Stop media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }

    console.log('Audio cleanup complete');
  }
}

// Export for use in other modules
window.AudioManager = AudioManager;
