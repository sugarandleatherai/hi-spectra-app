/**
 * Main Application Logic
 *
 * Coordinates between:
 * - Audio management (microphone, wake word, speech recognition)
 * - UI management (display, controls, feedback)
 * - Backend communication (intent classification)
 * - Electron IPC (main process communication)
 *
 * @module app
 * @author Hi-Spectra Team
 * @version 1.0.0
 */

/**
 * HiSpectraApp Class
 * Main application controller
 */
class HiSpectraApp {
  constructor() {
    // Initialize managers
    this.audioManager = new AudioManager();
    this.uiManager = new UIManager();

    // Application state
    this.isInitialized = false;
    this.config = null;

    // Bind methods to preserve 'this' context
    this.handleWakeWordDetected = this.handleWakeWordDetected.bind(this);
    this.handleSpeechRecognized = this.handleSpeechRecognized.bind(this);
  }

  /**
   * Initialize the application
   */
  async initialize() {
    console.log('Initializing Hi-Spectra...');

    try {
      // Load configuration from Electron
      this.config = await window.electronAPI.getConfig();
      console.log('Configuration loaded:', this.config);

      // Update UI with config
      this.uiManager.loadSettings(this.config);

      // Set up UI callbacks
      this.uiManager.setCallbacks({
        onSendText: (text) => this.handleTextInput(text),
        onPushToTalkStart: () => this.handlePushToTalkStart(),
        onPushToTalkStop: () => this.handlePushToTalkStop(),
        onToggleWakeWord: (enabled) => this.handleToggleWakeWord(enabled),
        onSaveSettings: (settings) => this.handleSaveSettings(settings)
      });

      // Set up audio callbacks
      this.audioManager.onWakeWordDetected = this.handleWakeWordDetected;
      this.audioManager.onSpeechRecognized = this.handleSpeechRecognized;

      // Initialize audio
      const audioInitialized = await this.audioManager.initialize();

      if (!audioInitialized) {
        this.uiManager.showError('Failed to initialize microphone. Please check permissions.');
        return;
      }

      // Start listening for wake word
      this.audioManager.startContinuousListening();

      // Set up Electron IPC listeners
      this.setupElectronListeners();

      // Mark as initialized
      this.isInitialized = true;
      this.uiManager.updateStatus('Ready', 'ready');

      console.log('Hi-Spectra initialized successfully');
    } catch (error) {
      console.error('Failed to initialize:', error);
      this.uiManager.showError('Initialization failed: ' + error.message);
    }
  }

  /**
   * Set up Electron IPC listeners
   */
  setupElectronListeners() {
    // Listen for wake word toggle from main process (keyboard shortcut)
    window.electronAPI.onWakeWordToggle((enabled) => {
      this.audioManager.toggleWakeWord(enabled);
      this.uiManager.wakeWordEnabled = enabled;
      this.uiManager.updateStatus(
        enabled ? 'Wake word enabled' : 'Wake word disabled',
        'ready'
      );
    });

    // Listen for push-to-talk from main process (keyboard shortcut)
    window.electronAPI.onPushToTalkStart(() => {
      this.handlePushToTalkStart();
      // Auto-release after 5 seconds
      setTimeout(() => {
        this.handlePushToTalkStop();
      }, 5000);
    });

    // Listen for start listening event
    window.electronAPI.onStartListening(() => {
      this.uiManager.showListeningIndicator(true);
      this.uiManager.updateStatus('Listening...', 'active');
    });
  }

  /**
   * Handle wake word detection
   * @param {string} transcript - Full transcript including wake word
   */
  handleWakeWordDetected(transcript) {
    console.log('Wake word detected:', transcript);

    // Show visual feedback
    this.uiManager.showListeningIndicator(true);
    this.uiManager.updateStatus('Listening for command...', 'active');

    // Notify Electron main process
    window.electronAPI.sendWakeWordDetected({
      transcript: transcript,
      timestamp: Date.now()
    });

    // Set listening state
    this.audioManager.isListening = true;

    // Check if there's a command after the wake word
    const command = this.audioManager.removeWakeWord(transcript);

    if (command.length > 0) {
      // Command was spoken in same phrase as wake word
      // e.g., "Hey Spectra what's the weather"
      this.handleSpeechRecognized(command);
    } else {
      // Wait for next speech input (command will come in next recognition event)
      // This is handled automatically by continuous recognition
    }
  }

  /**
   * Handle speech recognition result
   * @param {string} transcript - Recognized speech
   */
  async handleSpeechRecognized(transcript) {
    console.log('Speech recognized:', transcript);

    // Show user message in UI
    this.uiManager.addMessage('user', transcript);

    // Reset listening state
    this.audioManager.isListening = false;
    this.uiManager.showListeningIndicator(false);
    this.uiManager.updateStatus('Processing...', 'active');

    // Classify intent
    await this.classifyAndRespond(transcript);
  }

  /**
   * Handle text input submission
   * @param {string} text - User text input
   */
  async handleTextInput(text) {
    console.log('Text input:', text);

    // Show user message in UI
    this.uiManager.addMessage('user', text);
    this.uiManager.updateStatus('Processing...', 'active');

    // Classify intent
    await this.classifyAndRespond(text);
  }

  /**
   * Handle push-to-talk start
   */
  handlePushToTalkStart() {
    console.log('Push-to-talk started');

    this.audioManager.startRecording();
    this.uiManager.updateStatus('Listening...', 'active');

    // Also start speech recognition if not already running
    if (!this.audioManager.recognition || this.audioManager.recognition.state === 'stopped') {
      this.audioManager.startContinuousListening();
    }

    this.audioManager.isListening = true;
  }

  /**
   * Handle push-to-talk stop
   */
  handlePushToTalkStop() {
    console.log('Push-to-talk stopped');

    this.audioManager.stopRecording();
    this.audioManager.isListening = false;

    // Recognition will continue in background for wake word
    // Final result will be processed by handleSpeechRecognized
  }

  /**
   * Handle wake word toggle
   * @param {boolean} enabled - Whether wake word is enabled
   */
  handleToggleWakeWord(enabled) {
    console.log('Wake word toggled:', enabled);

    this.audioManager.toggleWakeWord(enabled);

    // Update Electron main process
    window.electronAPI.updateSettings({
      wakeWordEnabled: enabled
    });
  }

  /**
   * Handle settings save
   * @param {Object} settings - Settings object
   */
  handleSaveSettings(settings) {
    console.log('Settings saved:', settings);

    // Update Electron main process
    window.electronAPI.updateSettings(settings);

    // Update audio sensitivity (if implemented)
    // TODO: Implement wake word sensitivity adjustment
  }

  /**
   * Classify user input and generate response
   * @param {string} text - User input text
   */
  async classifyAndRespond(text) {
    try {
      // Call backend API via Electron IPC
      const result = await window.electronAPI.classifyIntent(text);

      if (!result.success) {
        throw new Error(result.error);
      }

      const { classification, clarification } = result.data;

      console.log('Classification result:', classification);

      // Generate and display response
      const response = this.generateResponse(classification, clarification);

      this.uiManager.addMessage('assistant', response, {
        confidence: classification.confidence,
        intent: classification.intent.name
      });

      this.uiManager.updateStatus('Ready', 'ready');

    } catch (error) {
      console.error('Classification error:', error);
      this.uiManager.showError('Failed to process request: ' + error.message);
      this.uiManager.updateStatus('Ready', 'ready');
    }
  }

  /**
   * Generate response based on classification
   * @param {Object} classification - Classification result
   * @param {string} clarification - Clarification message if needed
   * @returns {string} Response message
   */
  generateResponse(classification, clarification) {
    const intent = classification.intent;

    // If clarification is needed, return that
    if (clarification) {
      return clarification;
    }

    // Generate response based on intent
    // In production, this would execute actual actions
    switch (intent.name) {
      case 'greeting':
        return "Hello! How can I help you today?";

      case 'goodbye':
        return "Goodbye! Have a great day!";

      case 'get_weather':
        return "I'd check the weather for you, but I need to be connected to a weather service. This is a placeholder response.";

      case 'set_timer':
        const duration = classification.parameters.duration;
        if (duration) {
          return `Timer set for ${duration.value} ${duration.unit}. I'll notify you when it's done!`;
        }
        return "How long should the timer be?";

      case 'set_alarm':
        const time = classification.parameters.time;
        if (time) {
          return `Alarm set for ${time}. I'll make sure to wake you up!`;
        }
        return "What time should I set the alarm for?";

      case 'play_music':
        return "Playing music... (This would start music playback in production)";

      case 'stop_media':
        return "Stopped playback.";

      case 'volume_control':
        const action = classification.parameters.action;
        return `Volume ${action}. (This would control system volume in production)`;

      case 'get_time':
        const now = new Date();
        return `The current time is ${now.toLocaleTimeString()}.`;

      case 'get_date':
        const today = new Date();
        return `Today is ${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;

      case 'search_web':
        const query = classification.parameters.query;
        return `I'd search for "${query}" for you, but web search isn't fully implemented yet.`;

      case 'ask_capability':
        return `I can help with: weather, timers, alarms, music, time/date, searches, and more! Try asking me to set a timer or check the weather.`;

      case 'tell_joke':
        const jokes = [
          "Why did the voice assistant go to therapy? It had too many unresolved queries!",
          "What's a computer's favorite snack? Microchips!",
          "Why do programmers prefer dark mode? Because light attracts bugs!"
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];

      case 'fallback':
        return "I didn't quite understand that. Try asking about the weather, setting a timer, or say 'help' to see what I can do.";

      default:
        return `I understand you want to ${intent.description}. (Handler for "${intent.name}" not yet implemented)`;
    }
  }

  /**
   * Cleanup when app closes
   */
  cleanup() {
    console.log('Cleaning up...');
    this.audioManager.cleanup();
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new HiSpectraApp();
  app.initialize();

  // Cleanup on window unload
  window.addEventListener('beforeunload', () => {
    app.cleanup();
  });

  // Make app globally available for debugging
  window.hiSpectraApp = app;
});
