/**
 * Hi-Spectra Desktop Application - Main Process
 *
 * This is the Electron main process that:
 * - Creates and manages the application window
 * - Handles system-level operations
 * - Manages IPC (Inter-Process Communication) with renderer
 * - Coordinates wake word detection and audio input
 *
 * @module main
 * @author Hi-Spectra Team
 * @version 1.0.0
 */

const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

// Configuration
const isDev = process.argv.includes('--dev');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Global references to prevent garbage collection
let mainWindow = null;
let audioRecording = false;
let wakeWordActive = true;

/**
 * Create the main application window
 * Sets up the Electron browser window with proper security settings
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      // Security: Enable context isolation
      contextIsolation: true,
      // Security: Disable Node integration in renderer
      nodeIntegration: false,
      // Enable preload script for secure IPC
      preload: path.join(__dirname, 'preload.js')
    },
    // Window styling
    title: 'Hi-Spectra Voice Assistant',
    backgroundColor: '#1a1a2e',
    // Show window when ready
    show: false
  });

  // Load the UI
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Hi-Spectra window ready');
  });

  // Cleanup when window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Register global keyboard shortcuts
 * - Ctrl/Cmd + Shift + Space: Push-to-talk
 * - Ctrl/Cmd + Shift + W: Toggle wake word
 */
function registerShortcuts() {
  // Push-to-talk shortcut
  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    console.log('Push-to-talk activated');
    mainWindow.webContents.send('push-to-talk-start');
  });

  // Toggle wake word
  globalShortcut.register('CommandOrControl+Shift+W', () => {
    wakeWordActive = !wakeWordActive;
    console.log(`Wake word ${wakeWordActive ? 'enabled' : 'disabled'}`);
    mainWindow.webContents.send('wake-word-toggle', wakeWordActive);
  });

  console.log('Global shortcuts registered');
}

/**
 * Initialize the application
 * Called when Electron has finished initialization
 */
app.whenReady().then(() => {
  createWindow();
  registerShortcuts();

  // macOS: Re-create window when dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * Quit when all windows are closed (except on macOS)
 * macOS apps typically stay active until user quits explicitly (Cmd+Q)
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Cleanup before quitting
 */
app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
  console.log('Application shutting down');
});

/**
 * IPC Handlers
 * These handle communication from the renderer process
 */

/**
 * Handle wake word detection event
 * Sent from renderer when wake word is detected in audio
 */
ipcMain.on('wake-word-detected', (event, data) => {
  console.log('Wake word detected:', data);
  // Notify renderer to start listening for command
  mainWindow.webContents.send('start-listening');
});

/**
 * Handle intent classification request
 * Sends user input to backend for intent classification
 */
ipcMain.handle('classify-intent', async (event, text) => {
  console.log('Classifying intent:', text);

  try {
    // In production, this would make HTTP request to backend
    // For now, return mock response
    const axios = require('axios');

    const response = await axios.post(`${BACKEND_URL}/api/intents/classify`, {
      text: text
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Intent classification error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
});

/**
 * Handle audio recording start
 * Manages audio stream for speech recognition
 */
ipcMain.on('start-recording', (event) => {
  console.log('Starting audio recording');
  audioRecording = true;
  // TODO: Initialize audio recording with proper audio device
  // This would use native modules or Web Audio API via renderer
});

/**
 * Handle audio recording stop
 */
ipcMain.on('stop-recording', (event) => {
  console.log('Stopping audio recording');
  audioRecording = false;
  // TODO: Stop audio recording and process audio data
});

/**
 * Handle text input submission (manual text mode)
 */
ipcMain.handle('submit-text', async (event, text) => {
  console.log('Text input submitted:', text);

  try {
    const axios = require('axios');

    const response = await axios.post(`${BACKEND_URL}/api/intents/classify`, {
      text: text
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Text submission error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
});

/**
 * Get application configuration
 */
ipcMain.handle('get-config', async () => {
  return {
    backendUrl: BACKEND_URL,
    wakeWords: ['hey spectra', 'high spectra'],
    version: app.getVersion(),
    platform: process.platform
  };
});

/**
 * Handle settings updates
 */
ipcMain.on('update-settings', (event, settings) => {
  console.log('Settings updated:', settings);

  // Update wake word active state
  if (settings.wakeWordEnabled !== undefined) {
    wakeWordActive = settings.wakeWordEnabled;
  }

  // TODO: Persist settings to local storage or config file
});

console.log('═══════════════════════════════════════════');
console.log('  Hi-Spectra Desktop Application');
console.log('═══════════════════════════════════════════');
console.log(`  Mode: ${isDev ? 'Development' : 'Production'}`);
console.log(`  Backend: ${BACKEND_URL}`);
console.log(`  Electron: ${process.versions.electron}`);
console.log(`  Node: ${process.versions.node}`);
console.log('═══════════════════════════════════════════');
