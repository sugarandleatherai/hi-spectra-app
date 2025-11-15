# Hi-Spectra

**A continuous cognitive bridge for neurodivergent and trauma-affected minds.**

Hi-Spectra (H-I) is an AI assistant that helps clarify communication, translate intent, decode tone, and provide emotional regulation support. It's designed specifically for people with autism, ADHD, CPTSD, anxiety, and other neurodivergent experiences.

## Overview

Hi-Spectra acts as a "co-brain" - not just a chatbot, but a real-time co-processing layer that helps with:

- **Self-Translation**: Clarifying what you meant to say
- **Message Decoding**: Understanding what others might have meant
- **Emotional Regulation**: Grounding and stabilization when overwhelmed
- **Cognitive Support**: Context tracking and thread management

## Wake Phrase

Hi-Spectra responds to three equivalent wake phrases (all normalized internally):

- "Hi Spectra" (H-I - canonical spelling)
- "High Spectra"
- "Hey Spectra"

All three are treated identically by the system.

## Architecture

This is an MVP prototype with:

**Backend**: FastAPI (Python)
- Wake phrase detection and normalization
- Intent classification
- Modular service architecture
- RESTful API endpoints
- Future: WebSocket support for streaming

**Frontend**: React + Vite
- Clean, accessible interface
- Real-time API communication
- Visual feedback for different intents
- Responsive design

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- pip and npm

### 1. Start the Backend

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload
```

Backend will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

### 2. Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend will be available at: http://localhost:5173

## Usage Examples

### Self-Translation

```
User: "Hi Spectra, what was I trying to say?"
Spectra: [Helps clarify and rephrase user's intended message]
```

### Decode Others

```
User: "Hey Spectra, what did they mean by 'we need to talk'?"
Spectra: [Analyzes tone, provides possible interpretations, suggests response]
```

### Emotional Regulation

```
User: "Hi Spectra, I'm overwhelmed right now"
Spectra: [Provides validation, grounding techniques, immediate actions]
```

## API Endpoints

### Unified Processing (Recommended)

```bash
POST /spectra/process
{
  "message": "Hi Spectra, what did they mean?",
  "context": {}
}
```

### Specific Endpoints

- `POST /spectra/intent` - Classify intent
- `POST /spectra/translate` - Self-translation
- `POST /spectra/decode` - Decode others
- `POST /spectra/regulate` - Emotional regulation

See [backend/README.md](backend/README.md) for detailed API documentation.

## Project Structure

```
hi-spectra-app/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── models.py            # Pydantic schemas
│   │   ├── routes.py            # API endpoints
│   │   └── services/
│   │       ├── wake_phrase.py   # Wake phrase detection
│   │       ├── intent.py        # Intent classification
│   │       ├── translator.py    # Self-translation
│   │       ├── decoder.py       # Message decoder
│   │       └── regulator.py     # Emotional regulation
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main component
│   │   ├── main.jsx             # Entry point
│   │   └── styles.css           # Styles
│   ├── index.html
│   ├── package.json
│   └── README.md
└── README.md
```

## Intent Types

The system recognizes these intent types:

- **SELF_TRANSLATE**: User wants to clarify what they meant
- **OTHER_TRANSLATE**: User wants to decode what someone else meant
- **REGULATE**: User needs emotional regulation support
- **MEMORY**: User wants to store/recall information (future)
- **COGNITIVE_SUPPORT**: Thread tracking, context help (future)
- **UNKNOWN**: Intent not recognized

## Development Philosophy

Hi-Spectra is built with these principles:

1. **Gentle and Stabilizing**: No shame, no judgment
2. **Human-First**: Designed for neurodivergent experiences
3. **Clear Communication**: Explicit, structured responses
4. **Modular Architecture**: Easy to extend and customize
5. **Privacy-Aware**: User data stays local (for now)

## Current Status: MVP

This is a text-based prototype. Current features:

- ✅ Wake phrase detection (all three variations)
- ✅ Intent classification
- ✅ Self-translation (stubbed responses)
- ✅ Message decoding (stubbed responses)
- ✅ Emotional regulation support
- ✅ REST API
- ✅ Web interface

## Roadmap

### Phase 1: AI Integration
- [ ] OpenAI API integration for smarter responses
- [ ] User profile and memory storage
- [ ] Conversation history tracking
- [ ] Context-aware responses

### Phase 2: Audio
- [ ] Whisper integration for speech-to-text
- [ ] Voice activity detection
- [ ] Text-to-speech responses
- [ ] WebSocket streaming

### Phase 3: Advanced Features
- [ ] Dual-channel audio (world + spectral overlay)
- [ ] Meeting mode
- [ ] Real-time conversation support
- [ ] Mobile app

### Phase 4: Hardware
- [ ] Forearm-mounted interface (Iron Man concept)
- [ ] Haptic feedback
- [ ] Quick mode buttons
- [ ] Wearable integration

## Testing

### Backend Tests

```bash
cd backend
pytest
```

### Manual Testing

Use the interactive API docs:
- http://localhost:8000/docs

Or use curl:

```bash
curl -X POST "http://localhost:8000/spectra/process" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hi Spectra, help me stay regulated"}'
```

## Contributing

This is an early-stage project. If you're interested in contributing:

1. Focus on the neurodivergent user experience
2. Keep responses gentle, clear, and non-judgmental
3. Maintain modular architecture
4. Test with real ND users when possible

## Philosophy

Hi-Spectra is designed to be:

- **A co-processor**, not a replacement for human connection
- **A stabilizer**, not a crutch
- **A bridge**, not a barrier
- **A support**, not a surveillance tool

## Brand Voice

- Gentle
- Clear
- Warm
- Stabilizing
- Human-first
- No shame

## License

MIT

## Support

For neurodivergent and trauma-affected users:
- This tool is meant to support you, not fix you
- You're not broken - your nervous system is doing its best
- What you're experiencing is real and valid
- This is one tool among many - use what helps

---

**Hi-Spectra v0.1.0 - MVP**

*"A continuous cognitive bridge for neurodivergent and trauma-affected minds."*
