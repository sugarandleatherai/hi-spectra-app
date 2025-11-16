# Hi-Spectra Architecture

## System Overview

Hi-Spectra is a voice-first assistant application built with a modular, three-tier architecture:

1. **Desktop Layer** (Electron) - User interface and local audio processing
2. **Backend Layer** (Node.js/Express) - NLU, intent classification, and business logic
3. **Coherence Layer** - Intent validation and prompt management

```
┌─────────────────────────────────────────────────────────┐
│                    Desktop (Electron)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Audio      │  │     UI       │  │  IPC Bridge  │ │
│  │  Management  │  │  Management  │  │   (Preload)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP/WebSocket
┌───────────────────────────┴─────────────────────────────┐
│                 Backend (Node.js/Express)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Intent API  │  │ NLU Service  │  │    Speech    │ │
│  │   Routes     │  │  (Classify)  │  │   Service    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────┐
│                    Coherence Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Intent     │  │    Prompt    │  │  Validation  │ │
│  │   Schemas    │  │     Bank     │  │    Model     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Desktop Layer (Electron)

### Purpose
Provides the user interface and handles local audio/speech processing.

### Components

#### Main Process (`main.js`)
- **Responsibilities**:
  - Window management
  - Global keyboard shortcuts
  - IPC communication with renderer
  - System-level integrations
- **Key Features**:
  - Security-hardened (context isolation, no node integration in renderer)
  - Global shortcuts for wake word toggle and push-to-talk
  - Backend API communication

#### Preload Script (`preload.js`)
- **Purpose**: Secure bridge between main and renderer processes
- **Security**: Uses contextBridge to expose only necessary APIs
- **APIs Exposed**:
  - Wake word detection
  - Audio recording controls
  - Intent classification
  - Settings management

#### Renderer Process

**Audio Manager (`audio.js`)**
- Microphone access and audio stream management
- Wake word detection (using Web Speech API)
- Speech recognition (continuous listening)
- Audio visualization (waveform display)
- Audio recording for processing

**UI Manager (`ui.js`)**
- Message display and conversation history
- Status indicators and visual feedback
- Input controls (text, voice, settings)
- Settings panel management

**App Controller (`app.js`)**
- Main application orchestration
- Coordinates audio and UI managers
- Handles Electron IPC communication
- Intent classification requests
- Response generation

### Technology Stack
- **Electron** v28+ - Desktop app framework
- **Web Speech API** - Browser-native speech recognition
- **Web Audio API** - Audio processing and visualization
- **HTML/CSS/JavaScript** - Renderer UI

## Backend Layer (Node.js/Express)

### Purpose
Provides NLU capabilities, intent classification, and API endpoints.

### Components

#### API Routes (`routes/intents.js`)
- **Endpoints**:
  - `POST /api/intents/classify` - Classify single input
  - `POST /api/intents/batch` - Batch classification
  - `GET /api/intents` - List all intents
  - `GET /api/intents/:id` - Get specific intent
  - `GET /health` - Health check

#### NLU Service (`services/nluService.js`)
- **Intent Classification**:
  - Fuzzy string matching using Levenshtein distance
  - Keyword boosting for improved accuracy
  - Confidence scoring and threshold validation
- **Parameter Extraction**:
  - Regex-based extraction (time, duration, numbers)
  - Keyword extraction for queries
  - Entity recognition (basic implementation)
- **Text Preprocessing**:
  - Lowercase normalization
  - Punctuation removal
  - Whitespace cleanup

#### Speech Service (`services/speechService.js`)
- **Current**: Placeholder implementations
- **Future**:
  - Speech-to-text (Whisper API integration)
  - Text-to-speech (Google TTS, ElevenLabs, etc.)
  - Wake word detection (Porcupine, custom model)
  - Streaming transcription

#### Intent Schemas (`models/intentSchemas.js`)
- **25 Core Intents** defined with:
  - Unique ID and name
  - Description
  - Example utterances
  - Required/optional parameters
  - Confidence thresholds
  - Response types

### Technology Stack
- **Node.js** v18+ - Runtime
- **Express** v4 - Web framework
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging

### Future Enhancements
- Replace fuzzy matching with ML model (BERT, GPT fine-tuned)
- Add Named Entity Recognition (NER)
- Implement conversation state tracking
- Add database for conversation history
- Integrate actual speech services (Whisper, etc.)

## Coherence Layer

### Purpose
Ensures intent classification is coherent, actionable, and recoverable when ambiguous.

### Components

#### Classifier Coherence Model (`coherence/classifier-coherence.md`)
- **Preprocessing**: Input normalization
- **Classification**: Fuzzy matching with confidence scoring
- **Parameter Extraction**: Entity/slot extraction
- **Coherence Validation**: Confidence + parameter completeness
- **Decision Logic**: Execute, confirm, or clarify

#### Prompt Bank
Collection of prompt templates for different scenarios:

1. **Clarification Prompts** (`prompt-bank/clarification.md`)
   - Missing required parameters
   - Low confidence classifications
   - Ambiguous inputs
   - Parameter validation failures

2. **Rephrase Prompts** (`prompt-bank/rephrase.md`)
   - Complete classification failures
   - Unintelligible input
   - Multiple consecutive failures
   - ASR errors

3. **Grounding Prompts** (`prompt-bank/grounding.md`)
   - Capability explanations
   - Out-of-scope requests
   - Feature discovery
   - Usage instructions

### Coherence Scoring

```javascript
Coherence Score = (confidence × 0.6) +
                  (parameter_completeness × 0.3) +
                  (validity × 0.1)
```

**Decision Matrix**:
- **High (>0.8)**: Execute action immediately
- **Medium (0.5-0.8)**: Request confirmation
- **Low (<0.5)**: Request clarification/rephrase

## Data Flow

### Voice Input Flow

```
1. User speaks "Hey Spectra, what's the weather?"
   ↓
2. Audio Manager detects wake word "Hey Spectra"
   ↓
3. Speech Recognition transcribes: "what's the weather"
   ↓
4. Desktop sends to Backend: POST /api/intents/classify
   ↓
5. NLU Service preprocesses: "whats the weather"
   ↓
6. Classifier matches to intent: "get_weather" (85% confidence)
   ↓
7. Parameter extraction: {location: null, date: null}
   ↓
8. Coherence validation: PASS (high confidence)
   ↓
9. Backend returns: {intent: get_weather, confidence: 0.85, ...}
   ↓
10. Desktop generates response and displays
   ↓
11. TTS speaks response (future)
```

### Text Input Flow

```
1. User types "set timer 10 minutes"
   ↓
2. UI Manager captures input
   ↓
3. Desktop sends to Backend: POST /api/intents/classify
   ↓
4. [Same as voice flow from step 5]
```

## Security Architecture

### Desktop Security
- **Context Isolation**: Renderer process isolated from Node.js
- **No Node Integration**: Renderer cannot access Node APIs directly
- **Preload Script**: Controlled API exposure via contextBridge
- **CSP**: Content Security Policy in HTML

### Backend Security
- **Helmet**: Security headers (XSS protection, CSP, etc.)
- **CORS**: Restricted to allowed origins
- **Input Validation**: All inputs validated before processing
- **Rate Limiting**: Future enhancement to prevent abuse

### Privacy
- **Local Processing**: Speech recognition happens locally when possible
- **No Logging**: User conversations not stored (configurable)
- **Minimal Data**: Only send necessary data to backend
- **API Keys**: Stored in environment variables, never committed

## Scalability Considerations

### Current Architecture (v1.0)
- **Scale**: Single user, local deployment
- **Backend**: Single server instance
- **Storage**: In-memory (no database)

### Future Architecture (v2.0+)

**Horizontal Scaling**:
- Multiple backend instances behind load balancer
- Redis for session management
- Database for conversation history

**Distributed Architecture**:
```
┌─────────────┐
│   Clients   │ (Multiple desktop apps)
└──────┬──────┘
       │
┌──────┴──────┐
│Load Balancer│
└──────┬──────┘
       │
  ┌────┴────┐
  │ Backend │ (Multiple instances)
  │ Cluster │
  └────┬────┘
       │
  ┌────┴────────────┬─────────────┐
  │                 │             │
┌─┴─────┐    ┌──────┴───┐  ┌────┴─────┐
│ Redis │    │ Database │  │ ML Model │
│(Cache)│    │(Postgres)│  │ Service  │
└───────┘    └──────────┘  └──────────┘
```

## Error Handling

### Desktop Layer
- **Audio Errors**: Fallback to text input
- **Network Errors**: Show user-friendly message, retry
- **Recognition Errors**: Request rephrase

### Backend Layer
- **Classification Errors**: Return fallback intent
- **Parameter Errors**: Request clarification
- **System Errors**: Log and return 500 with safe message

### Recovery Strategies
1. **Graceful Degradation**: Core features work even if some fail
2. **User Communication**: Clear error messages
3. **Automatic Retry**: Network requests retry with backoff
4. **Fallback Modes**: Text input when voice fails

## Deployment

### Development
```bash
# Backend
cd backend
npm install
npm run dev

# Desktop
cd desktop
npm install
npm start
```

### Production

**Backend**:
- Deploy to cloud (AWS, Heroku, DigitalOcean)
- Use PM2 for process management
- Configure environment variables
- Set up monitoring (Sentry, LogRocket)

**Desktop**:
- Build with electron-builder
- Sign application for distribution
- Package for Mac/Windows/Linux
- Auto-update mechanism (electron-updater)

## Monitoring & Observability

### Metrics to Track
- **Intent Classification Accuracy**: % correct classifications
- **Average Confidence Score**: Mean confidence across requests
- **Clarification Rate**: % requests needing clarification
- **Response Time**: API latency (p50, p95, p99)
- **Error Rate**: % of failed requests
- **User Engagement**: Daily/weekly active users

### Logging
- **Backend**: Morgan for HTTP requests, Winston for app logs
- **Desktop**: Electron-log for app events
- **Centralized**: Send logs to ELK stack or similar

## Technology Decisions

### Why Electron?
- **Cross-platform**: Single codebase for Mac/Windows/Linux
- **Web Technologies**: Familiar stack (HTML/CSS/JS)
- **Rich Ecosystem**: Large community, many plugins
- **System Access**: Can access microphone, filesystem, etc.

**Alternative Considered**: Tauri (lighter but less mature)

### Why Node.js/Express?
- **JavaScript**: Same language as desktop frontend
- **Fast Development**: Quick to prototype and iterate
- **Ecosystem**: Huge npm package repository
- **Async I/O**: Good for API services

**Alternative Considered**: Python/Flask (better ML integration)

### Why Fuzzy Matching (v1)?
- **Simple**: Easy to implement and debug
- **No Training**: Works immediately with examples
- **Transparent**: Easy to understand why it matched
- **Lightweight**: No ML model to load

**Future**: Will migrate to transformer-based model (BERT, etc.)

## Future Roadmap

### v1.1 (Q2 2025)
- [ ] Add conversation context tracking
- [ ] Implement actual speech services (Whisper)
- [ ] Add database for history
- [ ] Improve parameter extraction with NER

### v2.0 (Q3 2025)
- [ ] Replace fuzzy matching with ML model
- [ ] Multi-turn dialogue support
- [ ] Personalized intent models per user
- [ ] Plugin system for custom intents

### v3.0 (Q4 2025)
- [ ] Multi-language support
- [ ] Voice cloning for TTS
- [ ] Smart home integrations
- [ ] Mobile app (React Native)

---

**Last Updated**: 2025-01-16
**Version**: 1.0.0
**Maintainers**: Hi-Spectra Team
