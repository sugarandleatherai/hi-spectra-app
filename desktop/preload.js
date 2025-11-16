/**
 * Hi-Spectra Desktop Application - Preload Script
 *
 * This script runs before the renderer process loads.
 * It provides a secure bridge between the main process and renderer process.
 *
 * Security Best Practices:
 * - Only expose specific, necessary APIs to renderer
 * - Validate all inputs from renderer
 * - Never expose entire Node.js modules
 * - Use contextBridge for controlled exposure
 *
 * @module preload
 * @author Hi-Spectra Team
 * @version 1.0.0
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose secure APIs to renderer process
 * These will be available as window.electronAPI in renderer
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Wake Word Detection
   */

  // Send wake word detected event to main process
  sendWakeWordDetected: (data) => {
    ipcRenderer.send('wake-word-detected', data);
  },

  // Listen for wake word toggle from main process
  onWakeWordToggle: (callback) => {
    ipcRenderer.on('wake-word-toggle', (event, enabled) => {
      callback(enabled);
    });
  },

  /**
   * Audio Recording
   */

  // Start audio recording
  startRecording: () => {
    ipcRenderer.send('start-recording');
  },

  // Stop audio recording
  stopRecording: () => {
    ipcRenderer.send('stop-recording');
  },

  // Listen for push-to-talk start
  onPushToTalkStart: (callback) => {
    ipcRenderer.on('push-to-talk-start', callback);
  },

  // Listen for start listening event
  onStartListening: (callback) => {
    ipcRenderer.on('start-listening', callback);
  },

  /**
   * Intent Classification
   */

  // Classify user intent (async)
  classifyIntent: async (text) => {
    return await ipcRenderer.invoke('classify-intent', text);
  },

  // Submit text input (async)
  submitText: async (text) => {
    return await ipcRenderer.invoke('submit-text', text);
  },

  /**
   * Configuration
   */

  // Get application configuration
  getConfig: async () => {
    return await ipcRenderer.invoke('get-config');
  },

  // Update settings
  updateSettings: (settings) => {
    ipcRenderer.send('update-settings', settings);
  },

  /**
   * Utility
   */

  // Get platform information
  platform: process.platform,

  // Check if running in development mode
  isDev: process.argv.includes('--dev')
});

console.log('Preload script loaded - secure bridge established');
