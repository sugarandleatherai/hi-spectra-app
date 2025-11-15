# Hi-Spectra Backend

FastAPI backend for Hi-Spectra - a continuous cognitive bridge for neurodivergent and trauma-affected minds.

## Features

- **Wake Phrase Detection**: Recognizes "Hi Spectra", "High Spectra", and "Hey Spectra"
- **Intent Classification**: Automatically classifies user intent (SELF_TRANSLATE, OTHER_TRANSLATE, REGULATE, etc.)
- **Self-Translation**: Helps users clarify what they meant to say
- **Message Decoding**: Interprets what others might have meant
- **Emotional Regulation**: Provides grounding and stabilization support

## Installation

### Prerequisites

- Python 3.9 or higher
- pip

### Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

### Development Mode

Start the server with auto-reload:

```bash
# From the backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or use the convenience script:

```bash
python -m app.main
```

The API will be available at:
- **Base URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Health Check

```bash
GET /health
```

### Process Message (Unified)

The main endpoint that handles everything:

```bash
POST /spectra/process
Content-Type: application/json

{
  "message": "Hi Spectra, what did they mean by that?",
  "context": {}
}
```

### Specific Endpoints

#### Intent Classification
```bash
POST /spectra/intent
```

#### Self-Translation
```bash
POST /spectra/translate
```

#### Decode Others
```bash
POST /spectra/decode
```

#### Emotional Regulation
```bash
POST /spectra/regulate
```

## Example Requests

### Self-Translation Example

```bash
curl -X POST "http://localhost:8000/spectra/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hi Spectra, what was I trying to say?",
    "subject": "I said something confusing in the meeting"
  }'
```

### Decode Example

```bash
curl -X POST "http://localhost:8000/spectra/decode" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hey Spectra, what did they mean by that?",
    "subject": "We need to talk about your performance"
  }'
```

### Regulation Example

```bash
curl -X POST "http://localhost:8000/spectra/regulate" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hi Spectra, I am overwhelmed right now"
  }'
```

### Unified Process Example

```bash
curl -X POST "http://localhost:8000/spectra/process" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "High Spectra, help me stay regulated"
  }'
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── models.py            # Pydantic schemas
│   ├── routes.py            # API endpoints
│   └── services/
│       ├── __init__.py
│       ├── wake_phrase.py   # Wake phrase detection
│       ├── intent.py        # Intent classification
│       ├── translator.py    # Self-translation engine
│       ├── decoder.py       # Message decoder
│       └── regulator.py     # Emotional regulation
├── requirements.txt
└── README.md
```

## Wake Phrase Recognition

All three variations are treated identically:
- "Hi Spectra" (H-I)
- "High Spectra"
- "Hey Spectra"

The system normalizes these to a single internal token.

## Intent Types

The system recognizes these intent types:

- `SELF_TRANSLATE`: User wants to clarify what they meant
- `OTHER_TRANSLATE`: User wants to decode what someone else meant
- `REGULATE`: User needs emotional regulation support
- `MEMORY`: User wants to store/recall information
- `COGNITIVE_SUPPORT`: User needs help with context/thread tracking
- `UNKNOWN`: Intent not recognized

## Development

### Running Tests

```bash
pytest
```

### Code Structure

The backend follows a service-oriented architecture:

1. **Wake Phrase Detector**: Identifies and strips wake phrases
2. **Intent Classifier**: Determines user intent from message
3. **Service Layer**: Specialized services for each intent type
4. **Routes**: API endpoints that orchestrate services
5. **Models**: Pydantic schemas for validation

## Future Enhancements

- [ ] OpenAI API integration for smarter responses
- [ ] WebSocket support for real-time streaming
- [ ] User profile and memory storage
- [ ] Audio processing with Whisper
- [ ] Session management
- [ ] Conversation history tracking

## License

MIT
