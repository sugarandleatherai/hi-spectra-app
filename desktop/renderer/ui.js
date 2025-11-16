/**
 * UI Management Module
 *
 * Handles all user interface interactions and updates:
 * - Message display (conversation)
 * - Status updates
 * - Button click handlers
 * - Settings panel
 * - Visual feedback
 *
 * @module ui
 * @author Hi-Spectra Team
 * @version 1.0.0
 */

/**
 * UIManager Class
 * Manages all UI-related functionality
 */
class UIManager {
  constructor() {
    // DOM elements
    this.elements = {
      // Conversation
      conversation: document.getElementById('conversation'),

      // Status indicators
      status: document.getElementById('status'),
      mode: document.getElementById('mode'),
      listeningIndicator: document.getElementById('listening-indicator'),

      // Input controls
      textInput: document.getElementById('text-input'),
      sendBtn: document.getElementById('send-btn'),
      pushToTalkBtn: document.getElementById('push-to-talk-btn'),
      toggleWakeWordBtn: document.getElementById('toggle-wake-word-btn'),
      wakeWordIcon: document.getElementById('wake-word-icon'),
      wakeWordText: document.getElementById('wake-word-text'),

      // Settings
      settingsPanel: document.getElementById('settings-panel'),
      settingsToggleBtn: document.getElementById('settings-toggle-btn'),
      closeSettingsBtn: document.getElementById('close-settings-btn'),
      saveSettingsBtn: document.getElementById('save-settings-btn'),
      wakeWordSensitivity: document.getElementById('wake-word-sensitivity'),
      sensitivityValue: document.getElementById('sensitivity-value'),
      backendUrl: document.getElementById('backend-url'),
      autoSend: document.getElementById('auto-send'),
      showConfidence: document.getElementById('show-confidence')
    };

    // State
    this.wakeWordEnabled = true;
    this.showConfidenceScores = false;

    // Initialize event listeners
    this.initializeEventListeners();
  }

  /**
   * Initialize all event listeners
   */
  initializeEventListeners() {
    // Text input - Enter key
    this.elements.textInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.onSendText();
      }
    });

    // Send button
    this.elements.sendBtn.addEventListener('click', () => {
      this.onSendText();
    });

    // Push-to-talk button (mouse/touch)
    this.elements.pushToTalkBtn.addEventListener('mousedown', () => {
      this.onPushToTalkStart();
    });

    this.elements.pushToTalkBtn.addEventListener('mouseup', () => {
      this.onPushToTalkStop();
    });

    this.elements.pushToTalkBtn.addEventListener('mouseleave', () => {
      this.onPushToTalkStop();
    });

    // Toggle wake word button
    this.elements.toggleWakeWordBtn.addEventListener('click', () => {
      this.toggleWakeWord();
    });

    // Settings panel
    this.elements.settingsToggleBtn.addEventListener('click', () => {
      this.openSettings();
    });

    this.elements.closeSettingsBtn.addEventListener('click', () => {
      this.closeSettings();
    });

    this.elements.saveSettingsBtn.addEventListener('click', () => {
      this.saveSettings();
    });

    // Sensitivity slider
    this.elements.wakeWordSensitivity.addEventListener('input', (e) => {
      this.elements.sensitivityValue.textContent = `${e.target.value}%`;
    });
  }

  /**
   * Set callbacks for UI events
   * These will be called from app.js
   */
  setCallbacks(callbacks) {
    this.onSendTextCallback = callbacks.onSendText;
    this.onPushToTalkStartCallback = callbacks.onPushToTalkStart;
    this.onPushToTalkStopCallback = callbacks.onPushToTalkStop;
    this.onToggleWakeWordCallback = callbacks.onToggleWakeWord;
    this.onSaveSettingsCallback = callbacks.onSaveSettings;
  }

  /**
   * Handle send text button click
   */
  onSendText() {
    const text = this.elements.textInput.value.trim();

    if (!text) return;

    // Clear input
    this.elements.textInput.value = '';

    // Call callback
    if (this.onSendTextCallback) {
      this.onSendTextCallback(text);
    }
  }

  /**
   * Handle push-to-talk start
   */
  onPushToTalkStart() {
    this.elements.pushToTalkBtn.classList.add('active');
    this.showListeningIndicator(true);

    if (this.onPushToTalkStartCallback) {
      this.onPushToTalkStartCallback();
    }
  }

  /**
   * Handle push-to-talk stop
   */
  onPushToTalkStop() {
    this.elements.pushToTalkBtn.classList.remove('active');
    this.showListeningIndicator(false);

    if (this.onPushToTalkStopCallback) {
      this.onPushToTalkStopCallback();
    }
  }

  /**
   * Toggle wake word on/off
   */
  toggleWakeWord() {
    this.wakeWordEnabled = !this.wakeWordEnabled;

    // Update UI
    if (this.wakeWordEnabled) {
      this.elements.wakeWordIcon.textContent = '👂';
      this.elements.wakeWordText.textContent = 'Disable Wake Word';
      this.elements.mode.textContent = 'Wake Word Active';
    } else {
      this.elements.wakeWordIcon.textContent = '🔇';
      this.elements.wakeWordText.textContent = 'Enable Wake Word';
      this.elements.mode.textContent = 'Manual Mode';
    }

    // Call callback
    if (this.onToggleWakeWordCallback) {
      this.onToggleWakeWordCallback(this.wakeWordEnabled);
    }
  }

  /**
   * Update status text and style
   * @param {string} text - Status text
   * @param {string} type - Status type: 'ready', 'active', 'error'
   */
  updateStatus(text, type = 'ready') {
    this.elements.status.textContent = text;
    this.elements.status.className = 'status';

    if (type === 'active') {
      this.elements.status.classList.add('active');
    }
  }

  /**
   * Show/hide listening indicator
   * @param {boolean} show - Whether to show the indicator
   */
  showListeningIndicator(show) {
    if (show) {
      this.elements.listeningIndicator.classList.add('active');
    } else {
      this.elements.listeningIndicator.classList.remove('active');
    }
  }

  /**
   * Add message to conversation
   * @param {string} type - Message type: 'user', 'assistant', 'system'
   * @param {string} content - Message content (can be HTML)
   * @param {Object} metadata - Optional metadata (confidence, intent, etc.)
   */
  addMessage(type, content, metadata = {}) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    // Choose icon based on type
    let icon = '💬';
    if (type === 'user') icon = '👤';
    else if (type === 'assistant') icon = '🤖';
    else if (type === 'system') icon = 'ℹ️';

    // Build message HTML
    let html = `
      <div class="message-icon">${icon}</div>
      <div class="message-content">
        <p>${content}</p>
    `;

    // Add metadata if showing confidence scores
    if (this.showConfidenceScores && metadata.confidence !== undefined) {
      const confidencePercent = Math.round(metadata.confidence * 100);
      html += `<div class="confidence">Confidence: ${confidencePercent}%</div>`;
    }

    if (metadata.intent) {
      html += `<div class="confidence">Intent: ${metadata.intent}</div>`;
    }

    html += `</div>`;

    messageDiv.innerHTML = html;

    // Add to conversation
    this.elements.conversation.appendChild(messageDiv);

    // Scroll to bottom
    this.elements.conversation.scrollTop = this.elements.conversation.scrollHeight;
  }

  /**
   * Clear all messages from conversation
   */
  clearConversation() {
    this.elements.conversation.innerHTML = '';
  }

  /**
   * Open settings panel
   */
  openSettings() {
    this.elements.settingsPanel.classList.add('open');
  }

  /**
   * Close settings panel
   */
  closeSettings() {
    this.elements.settingsPanel.classList.remove('open');
  }

  /**
   * Save settings
   */
  saveSettings() {
    const settings = {
      wakeWordSensitivity: parseInt(this.elements.wakeWordSensitivity.value),
      backendUrl: this.elements.backendUrl.value,
      autoSend: this.elements.autoSend.checked,
      showConfidence: this.elements.showConfidence.checked
    };

    this.showConfidenceScores = settings.showConfidence;

    console.log('Settings saved:', settings);

    // Call callback
    if (this.onSaveSettingsCallback) {
      this.onSaveSettingsCallback(settings);
    }

    // Show feedback
    this.updateStatus('Settings saved', 'ready');
    setTimeout(() => {
      this.updateStatus('Ready', 'ready');
    }, 2000);

    // Close panel
    this.closeSettings();
  }

  /**
   * Load settings from config
   * @param {Object} config - Configuration object
   */
  loadSettings(config) {
    if (config.backendUrl) {
      this.elements.backendUrl.value = config.backendUrl;
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.addMessage('system', `❌ Error: ${message}`);
    this.updateStatus('Error', 'error');
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccess(message) {
    this.addMessage('system', `✅ ${message}`);
  }
}

// Export for use in other modules
window.UIManager = UIManager;
