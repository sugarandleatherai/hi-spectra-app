# Hi-Spectra Desktop App

Electron-based desktop application providing voice and text interface for the Hi-Spectra voice assistant.

## 📁 Structure

```
desktop/
├── main.js              # Electron main process
├── preload.js           # Secure IPC bridge
├── renderer/            # UI and client logic
│   ├── index.html      # Main HTML interface
│   ├── styles.css      # Styling and themes
│   ├── audio.js        # Audio/speech management
│   ├── ui.js           # UI interactions
│   └── app.js          # Main application logic
├── package.json
└── assets/             # Icons, images (future)
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Running

**Development Mode:**
```bash
npm start
# or
npm run dev
```

**Production Mode:**
```bash
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

Built applications will be in `dist/` directory.

## 🎤 Features

### Wake Word Detection

Continuously listens for "Hey Spectra" or "High Spectra":

```javascript
// Configured in audio.js
const wakeWords = ['hey spectra', 'high spectra'];
```

**Flow:**
1. User says "Hey Spectra"
2. Visual pulse animation activates
3. App listens for command
4. User continues: "what's the weather?"
5. Command processed and response shown

### Push-to-Talk

Press and hold `Ctrl+Shift+Space` (or click button):

**Global Shortcut:**
```javascript
// Registered in main.js
globalShortcut.register('CommandOrControl+Shift+Space', () => {
  // Activate push-to-talk
});
```

### Manual Text Input

Type in text box and press Enter:
- Perfect for noisy environments
- Precise input control
- No microphone needed

## 🏗️ Architecture

### Process Model

```
┌─────────────────────────────────────────┐
│         Main Process (main.js)          │
│  - Window management                    │
│  - Global shortcuts                     │
│  - System integrations                  │
│  - Backend communication                │
└──────────────┬──────────────────────────┘
               │ IPC (preload.js)
┌──────────────┴──────────────────────────┐
│      Renderer Process (renderer/)       │
│  ┌──────────────────────────────────┐  │
│  │ Audio Manager (audio.js)         │  │
│  │ - Microphone access              │  │
│  │ - Wake word detection            │  │
│  │ - Speech recognition             │  │
│  │ - Audio visualization            │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ UI Manager (ui.js)               │  │
│  │ - Message display                │  │
│  │ - Button handlers                │  │
│  │ - Settings panel                 │  │
│  │ - Visual feedback                │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ App Controller (app.js)          │  │
│  │ - Coordinates audio & UI         │  │
│  │ - Handles classification         │  │
│  │ - Generates responses            │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Security

**Context Isolation**: Enabled
```javascript
// main.js
webPreferences: {
  contextIsolation: true,     // Isolate renderer from Node
  nodeIntegration: false,     // Disable Node in renderer
  preload: path.join(__dirname, 'preload.js')
}
```

**Preload Bridge**: Secure API exposure
```javascript
// preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  classifyIntent: (text) => ipcRenderer.invoke('classify-intent', text),
  // Only expose necessary functions
});
```

**Content Security Policy**: Strict CSP
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; style-src 'self' 'unsafe-inline'">
```

## 🎨 UI Components

### Main Interface

```
╔═══════════════════════════════════════════════════╗
║  🎙️ Hi-Spectra                    Ready | Wake Word ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║         [Audio Waveform Visualization]            ║
║                                                   ║
║  ┌─────────────────────────────────────────────┐ ║
║  │ 💬 Welcome to Hi-Spectra!                   │ ║
║  │    Try saying:                              │ ║
║  │    • "Hey Spectra, what's the weather?"     │ ║
║  │    • "Hey Spectra, set a timer"             │ ║
║  └─────────────────────────────────────────────┘ ║
║                                                   ║
║  [Type your command here...            ] [Send]   ║
║                                                   ║
║  [🎤 Push to Talk Ctrl+Shift+Space]               ║
║  [👂 Disable Wake Word Ctrl+Shift+W]              ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
                                              [⚙️]
```

### Settings Panel

```
╔═════════════════════════════════╗
║  Settings                    ✕  ║
╠═════════════════════════════════╣
║                                 ║
║ Wake Word Sensitivity           ║
║ ●──────────────────        70%  ║
║                                 ║
║ Backend URL                     ║
║ [http://localhost:3000]         ║
║                                 ║
║ ☑ Auto-send after wake word     ║
║ ☐ Show confidence scores        ║
║                                 ║
║ [Save Settings]                 ║
╚═════════════════════════════════╝
```

## 🎵 Audio Management

### Web Speech API

**Configuration:**
```javascript
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;        // Keep listening
recognition.interimResults = true;    // Get partial results
recognition.lang = 'en-US';           // Language
```

**Event Handlers:**
```javascript
recognition.onresult = (event) => {
  const transcript = event.results[last][0].transcript;
  // Process transcript
};

recognition.onerror = (error) => {
  // Handle errors (no-speech, network, etc.)
};

recognition.onend = () => {
  // Restart if wake word active
};
```

### Audio Visualization

Real-time waveform using Canvas API:

```javascript
// Get audio data
analyzer.getByteTimeDomainData(dataArray);

// Draw waveform
context.strokeStyle = isListening ? '#e94560' : '#533483';
context.beginPath();
for (let i = 0; i < bufferLength; i++) {
  const v = dataArray[i] / 128.0;
  const y = (v * canvas.height) / 2;
  context.lineTo(x, y);
  x += sliceWidth;
}
context.stroke();
```

**Visual States:**
- **Idle**: Blue waveform
- **Listening**: Red pulsing waveform
- **Processing**: Animated thinking state

## 🔌 IPC Communication

### Main → Renderer

```javascript
// main.js
mainWindow.webContents.send('wake-word-toggle', enabled);
mainWindow.webContents.send('start-listening');
```

```javascript
// renderer/app.js
window.electronAPI.onWakeWordToggle((enabled) => {
  // Handle wake word toggle
});
```

### Renderer → Main

```javascript
// renderer/app.js
const result = await window.electronAPI.classifyIntent(text);
```

```javascript
// main.js
ipcMain.handle('classify-intent', async (event, text) => {
  // Forward to backend
  const response = await axios.post(`${BACKEND_URL}/api/intents/classify`, {
    text: text
  });
  return response.data;
});
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Handler |
|----------|--------|---------|
| `Ctrl+Shift+Space` | Push-to-talk | `main.js` |
| `Ctrl+Shift+W` | Toggle wake word | `main.js` |
| `Enter` | Send text | `ui.js` |

**Registering Global Shortcuts:**
```javascript
// main.js
const { globalShortcut } = require('electron');

globalShortcut.register('CommandOrControl+Shift+Space', () => {
  mainWindow.webContents.send('push-to-talk-start');
});
```

## 🎨 Theming

### CSS Variables

```css
:root {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-tertiary: #0f3460;
  --accent-primary: #e94560;
  --accent-secondary: #533483;
  --text-primary: #eaeaea;
  --text-secondary: #a0a0a0;
}
```

### Custom Themes (Future)

Add to `styles.css`:
```css
[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --accent-primary: #0066cc;
  /* ... */
}
```

## 🐛 Debugging

### DevTools

Automatically opened in development:
```javascript
// main.js
if (isDev) {
  mainWindow.webContents.openDevTools();
}
```

### Console Logging

```javascript
// Enable in renderer
console.log('Debug message');

// Enable in main process
console.log('Main process log');
```

### Debugging IPC

```javascript
// Log all IPC messages
ipcMain.on('*', (event, ...args) => {
  console.log('IPC:', event.type, args);
});
```

## 🚀 Building & Distribution

### Build Configuration

```json
// package.json
"build": {
  "appId": "com.hispectra.app",
  "productName": "Hi-Spectra",
  "files": [
    "main.js",
    "preload.js",
    "renderer/**/*"
  ],
  "mac": {
    "category": "public.app-category.productivity",
    "target": ["dmg", "zip"]
  },
  "win": {
    "target": ["nsis", "portable"]
  },
  "linux": {
    "target": ["AppImage", "deb"]
  }
}
```

### Platform-Specific Builds

```bash
# macOS
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux

# All platforms
npm run build
```

### Code Signing (Production)

```json
"mac": {
  "identity": "Developer ID Application: Your Name (TEAM_ID)",
  "hardenedRuntime": true,
  "entitlements": "entitlements.mac.plist"
}
```

## 🔧 Development Tips

### Hot Reload

Using `nodemon` for development:
```json
"scripts": {
  "dev": "nodemon --watch main.js --watch preload.js --exec electron ."
}
```

### Testing Shortcuts

Disable global shortcuts in development:
```javascript
if (!isDev) {
  registerShortcuts();
}
```

### Microphone Permissions

macOS requires microphone permission in `Info.plist`:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>Hi-Spectra needs microphone access for voice commands</string>
```

## 🤝 Contributing

### Adding UI Features

1. Update `renderer/index.html` for markup
2. Add styles in `renderer/styles.css`
3. Implement logic in `renderer/ui.js`
4. Wire up in `renderer/app.js`

### Adding Audio Features

1. Implement in `renderer/audio.js`
2. Update audio manager callbacks
3. Test with different audio inputs

### Best Practices

- ✅ Always use IPC for main ↔ renderer communication
- ✅ Never use `require()` in renderer (use preload)
- ✅ Sanitize all user inputs
- ✅ Handle errors gracefully
- ✅ Provide visual feedback for all actions

## 📚 Further Reading

- [Electron Documentation](https://www.electronjs.org/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**Questions?** Open an issue or check the [main documentation](../docs/).
