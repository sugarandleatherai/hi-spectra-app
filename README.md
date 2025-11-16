# Hi-Spectra Voice Assistant

A lightweight, privacy-focused voice assistant built with Electron and Node.js.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## 🎙️ Features

- **Wake Word Activation**: Hands-free operation with "Hey Spectra" or "High Spectra"
- **Push-to-Talk Mode**: Precise control with keyboard shortcut (Ctrl+Shift+Space)
- **Manual Text Input**: Type commands when voice isn't suitable
- **25 Core Intents**: Weather, timers, alarms, music, searches, and more
- **Privacy-Focused**: Local processing when possible, no data collection
- **Cross-Platform**: Works on Windows, macOS, and Linux

## 📁 Project Structure

```
hi-spectra-app/
├── backend/           # Node.js/Express API server
│   ├── routes/       # API endpoints
│   ├── services/     # NLU and speech processing
│   ├── models/       # Intent schemas (25 intents)
│   ├── tests/        # Comprehensive test suite
│   └── index.js      # Server entry point
│
├── coherence/        # Intent coherence model
│   ├── classifier-coherence.md
│   └── prompt-bank/  # Clarification/rephrase/grounding prompts
│
├── desktop/          # Electron desktop application
│   ├── main.js       # Electron main process
│   ├── preload.js    # IPC bridge
│   └── renderer/     # UI and client logic
│       ├── index.html
│       ├── styles.css
│       ├── audio.js  # Audio/speech management
│       ├── ui.js     # UI management
│       └── app.js    # Main app logic
│
└── docs/             # Documentation
    ├── architecture.md
    ├── user-flow.md
    └── voice-pipeline.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** v8 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hi-spectra-app.git
   cd hi-spectra-app
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install desktop dependencies**
   ```bash
   cd ../desktop
   npm install
   ```

### Running the Application

#### Option 1: Development Mode

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Start Desktop App:**
```bash
cd desktop
npm start
```

#### Option 2: Production Mode

**Build and run backend:**
```bash
cd backend
npm start
```

**Build desktop app:**
```bash
cd desktop
npm run build
```

## 🎯 Usage

### Voice Commands

After launching the application, try these commands:

**Wake Word Mode** (hands-free):
```
"Hey Spectra, what's the weather?"
"Hey Spectra, set a timer for 10 minutes"
"Hey Spectra, what time is it?"
```

**Push-to-Talk** (hold Ctrl+Shift+Space):
```
[Hold button] "What's the weather?" [Release]
```

**Text Input** (type in text box):
```
Type: "set alarm for 7am"
Press Enter
```

### Available Intents

| Category | Intents |
|----------|---------|
| **Greetings** | greeting, goodbye |
| **Information** | get_weather, get_time, get_date, search_web, get_news, get_definition |
| **Time Management** | set_timer, set_alarm, create_reminder, add_calendar_event |
| **Entertainment** | play_music, stop_media, tell_joke |
| **Communication** | send_message, make_call |
| **System Control** | volume_control, open_application, system_settings |
| **Utilities** | translate, calculate, get_directions |
| **Help** | ask_capability, fallback |

Full intent list in [`backend/models/intentSchemas.js`](backend/models/intentSchemas.js)

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
npm test
```

**Test Coverage:**
- ✅ 25 intent classification tests
- ✅ NLU service unit tests
- ✅ API endpoint integration tests
- ✅ Parameter extraction tests
- ✅ Edge case handling

**Coverage Report:**
```bash
npm test -- --coverage
```

## 📚 Documentation

- **[Architecture](docs/architecture.md)**: System design and components
- **[User Flow](docs/user-flow.md)**: User interactions and scenarios
- **[Voice Pipeline](docs/voice-pipeline.md)**: Speech processing pipeline
- **[Classifier Coherence](coherence/classifier-coherence.md)**: Intent classification model

### API Documentation

**Base URL**: `http://localhost:3000`

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | API information |
| POST | `/api/intents/classify` | Classify single input |
| POST | `/api/intents/batch` | Classify multiple inputs |
| GET | `/api/intents` | List all intents |
| GET | `/api/intents/:id` | Get specific intent |

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/intents/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "what time is it"}'
```

**Example Response:**
```json
{
  "success": true,
  "classification": {
    "intent": {
      "id": "intent_009",
      "name": "get_time",
      "description": "User asks for current time"
    },
    "confidence": 0.95,
    "parameters": {},
    "originalInput": "what time is it",
    "processedInput": "what time is it"
  },
  "clarification": null,
  "timestamp": "2025-01-16T12:00:00.000Z"
}
```

## 🛠️ Configuration

### Backend Configuration

Create `backend/.env` file:
```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:*,tauri://localhost
WHISPER_API_KEY=your_api_key_here
TTS_API_KEY=your_api_key_here
```

### Desktop Configuration

Settings accessible via gear icon in app:
- Wake word sensitivity
- Backend URL
- Auto-send preferences
- Display options

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+Space` | Push-to-talk |
| `Ctrl+Shift+W` | Toggle wake word |
| `Ctrl+/` | Focus text input |
| `Enter` | Send text |

## 🤝 Contributing

We welcome contributions from junior developers! All code is thoroughly commented to help you learn.

### Getting Started

1. Read the [Architecture Documentation](docs/architecture.md)
2. Check out the [Issues](https://github.com/yourusername/hi-spectra-app/issues)
3. Look for issues tagged `good-first-issue`
4. Fork the repository
5. Create a feature branch
6. Make your changes
7. Write/update tests
8. Submit a pull request

### Code Style

- **Comments**: All functions must have JSDoc comments
- **Testing**: New features must include tests
- **Formatting**: Use consistent indentation (2 spaces)
- **Naming**: Use descriptive variable/function names

### Adding a New Intent

1. Add intent schema to `backend/models/intentSchemas.js`
2. Add parameter extraction logic in `backend/services/nluService.js`
3. Add test cases in `backend/tests/intents.test.js`
4. Update this README with the new intent

**Example:**
```javascript
{
  id: "intent_026",
  name: "your_new_intent",
  description: "What this intent does",
  examples: [
    "example utterance 1",
    "example utterance 2",
    "example utterance 3"
  ],
  parameters: [
    { name: "param1", type: "string", required: true }
  ],
  confidence_threshold: 0.75,
  response_type: "action_confirmation"
}
```

## 🔒 Privacy & Security

- **Local Speech Recognition**: Uses Web Speech API (Chromium)
- **No Data Collection**: Conversations not stored or transmitted
- **Secure IPC**: Context isolation between Electron processes
- **API Keys**: Stored in environment variables
- **CORS Protection**: Restricted origins for API access

## 📈 Performance

**Target Metrics (v1.0)**:
- Classification Accuracy: >85%
- Parameter Extraction: >80%
- Response Time: <2 seconds
- Clarification Rate: <20%

**Current Performance** (on MacBook Pro M1):
- Average Classification: ~50ms
- Total Response Time: ~1.2s
- Memory Usage: ~150MB
- CPU Usage: <5% idle, <15% active

## 🗺️ Roadmap

### v1.1 (Q2 2025)
- [ ] Whisper API integration for improved ASR
- [ ] Text-to-speech response playback
- [ ] Conversation history persistence
- [ ] Named Entity Recognition (NER)

### v2.0 (Q3 2025)
- [ ] ML-based intent classification (BERT)
- [ ] Multi-turn dialogue support
- [ ] User personalization
- [ ] Plugin system

### v3.0 (Q4 2025)
- [ ] Multi-language support
- [ ] Smart home integrations
- [ ] Mobile app (React Native)
- [ ] Voice cloning for TTS

## ❓ Troubleshooting

### Microphone Not Working

1. Check browser/system permissions
2. Try manual text input mode
3. Restart the application

### Backend Not Connecting

1. Verify backend is running on port 3000
2. Check `BACKEND_URL` in desktop app settings
3. Ensure no firewall is blocking localhost

### Low Classification Accuracy

1. Speak clearly and at normal pace
2. Reduce background noise
3. Try push-to-talk mode
4. Use text input for complex commands

### Tests Failing

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Run tests with verbose output
npm test -- --verbose
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Web Speech API**: For browser-based speech recognition
- **Electron**: For cross-platform desktop framework
- **Express**: For simple, robust web framework
- **Jest**: For comprehensive testing
- **Community**: For feedback and contributions

## 📧 Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/hi-spectra-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/hi-spectra-app/discussions)
- **Email**: support@hispectra.app

---

Made with ❤️ by the Hi-Spectra Team

**⭐ Star us on GitHub if you find this helpful!**
