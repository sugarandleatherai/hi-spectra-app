# Hi-Spectra Backend

Node.js/Express API server providing NLU (Natural Language Understanding) and intent classification for the Hi-Spectra voice assistant.

## 📁 Structure

```
backend/
├── routes/
│   └── intents.js          # API endpoints for intent classification
├── services/
│   ├── nluService.js       # Intent classification and NLU logic
│   └── speechService.js    # Speech recognition/synthesis (placeholder)
├── models/
│   └── intentSchemas.js    # 25 core intent definitions
├── tests/
│   ├── setup.js            # Test configuration
│   ├── intents.test.js     # Intent classification tests
│   ├── nluService.test.js  # NLU service tests
│   └── routes.test.js      # API endpoint tests
├── index.js                # Express server entry point
├── package.json
├── jest.config.js
└── .env.example
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file (copy from `.env.example`):

```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:*,tauri://localhost
WHISPER_API_KEY=your_api_key_here
TTS_API_KEY=your_api_key_here
LOG_LEVEL=info
```

### Running

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

Server will be available at `http://localhost:3000`

## 📡 API Endpoints

### Health Check

**GET** `/health`

Check if server is running.

**Response:**
```json
{
  "status": "ok",
  "service": "hi-spectra-backend",
  "version": "1.0.0",
  "timestamp": "2025-01-16T12:00:00.000Z",
  "uptime": 123.45
}
```

### Classify Intent

**POST** `/api/intents/classify`

Classify a single user input.

**Request Body:**
```json
{
  "text": "what's the weather like today"
}
```

**Response:**
```json
{
  "success": true,
  "classification": {
    "intent": {
      "id": "intent_003",
      "name": "get_weather",
      "description": "User requests weather information",
      "examples": [...],
      "parameters": [...],
      "confidence_threshold": 0.75,
      "response_type": "data"
    },
    "confidence": 0.87,
    "parameters": {
      "location": null,
      "date": null
    },
    "originalInput": "what's the weather like today",
    "processedInput": "whats the weather like today"
  },
  "clarification": null,
  "timestamp": "2025-01-16T12:00:00.000Z"
}
```

### Batch Classify

**POST** `/api/intents/batch`

Classify multiple inputs at once (max 100).

**Request Body:**
```json
{
  "inputs": [
    "hello",
    "what time is it",
    "set a timer for 10 minutes"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    { "intent": {...}, "confidence": 0.92, ... },
    { "intent": {...}, "confidence": 0.95, ... },
    { "intent": {...}, "confidence": 0.89, ... }
  ],
  "count": 3,
  "timestamp": "2025-01-16T12:00:00.000Z"
}
```

### List Intents

**GET** `/api/intents?includeExamples=true`

Get all available intents.

**Query Parameters:**
- `includeExamples` (boolean, optional): Include example utterances

**Response:**
```json
{
  "success": true,
  "intents": [
    {
      "id": "intent_001",
      "name": "greeting",
      "description": "User greets the assistant",
      "parameters": [],
      "confidence_threshold": 0.7,
      "response_type": "acknowledgment",
      "exampleCount": 5
    },
    ...
  ],
  "count": 25,
  "timestamp": "2025-01-16T12:00:00.000Z"
}
```

### Get Intent by ID

**GET** `/api/intents/:id`

Get specific intent details.

**Example:** `/api/intents/intent_003`

**Response:**
```json
{
  "success": true,
  "intent": {
    "id": "intent_003",
    "name": "get_weather",
    "description": "User requests weather information",
    "examples": [
      "what's the weather like",
      "will it rain today",
      "temperature outside"
    ],
    "parameters": [
      { "name": "location", "type": "string", "required": false },
      { "name": "date", "type": "date", "required": false }
    ],
    "confidence_threshold": 0.75,
    "response_type": "data"
  },
  "timestamp": "2025-01-16T12:00:00.000Z"
}
```

## 🧠 NLU Service

### Classification Algorithm

The NLU service uses **fuzzy string matching** with Levenshtein distance:

1. **Preprocessing**: Normalize input (lowercase, remove punctuation)
2. **Similarity Calculation**: Compare against intent examples
3. **Keyword Boosting**: Boost score if key terms present
4. **Confidence Scoring**: Return best match above threshold

**Example:**
```javascript
const { classifyIntent } = require('./services/nluService');

const result = classifyIntent('set a timer for 10 minutes');

console.log(result.intent.name);     // "set_timer"
console.log(result.confidence);      // 0.89
console.log(result.parameters);      // { duration: { value: 10, unit: "minutes" } }
```

### Parameter Extraction

Intent-specific parameter extraction:

**Time Duration:**
```javascript
Input: "set timer for 10 minutes"
Output: { duration: { value: 10, unit: "minutes" } }
```

**Time:**
```javascript
Input: "set alarm for 7:30am"
Output: { time: "7:30am" }
```

**Volume:**
```javascript
Input: "set volume to 50"
Output: { action: "set", level: 50 }
```

**Query:**
```javascript
Input: "search for pizza recipes"
Output: { query: "pizza recipes" }
```

### Adding Custom Parameters

Edit `services/nluService.js`, function `extractParameters`:

```javascript
case 'your_intent_name':
  // Add extraction logic
  const match = text.match(/your regex pattern/);
  if (match) {
    params.yourParam = match[1];
  }
  break;
```

## 🎯 Intent Schemas

All 25 intents are defined in `models/intentSchemas.js`.

### Intent Structure

```javascript
{
  id: "intent_XXX",              // Unique identifier
  name: "intent_name",            // Programmatic name
  description: "What it does",    // Human description
  examples: [                     // Sample utterances
    "example 1",
    "example 2",
    "example 3"
  ],
  parameters: [                   // Expected entities
    {
      name: "param_name",
      type: "string",
      required: true
    }
  ],
  confidence_threshold: 0.75,     // Min confidence to accept
  response_type: "data"           // Response category
}
```

### Intent Categories

| Category | Intents | Threshold |
|----------|---------|-----------|
| **High-Risk** | make_call, send_message | 0.85 |
| **Medium-Risk** | set_timer, set_alarm | 0.75-0.80 |
| **Low-Risk** | get_weather, get_time | 0.70 |
| **Fallback** | fallback | 0.00 |

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test Suite

```bash
npm test -- intents.test.js
npm test -- nluService.test.js
npm test -- routes.test.js
```

### Watch Mode

```bash
npm test -- --watch
```

### Coverage Report

```bash
npm test -- --coverage
```

**Coverage Thresholds:**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Test Structure

**Intent Tests** (`tests/intents.test.js`):
- ✅ All 25 intents tested
- ✅ Multiple examples per intent
- ✅ Parameter extraction validation
- ✅ Confidence threshold checks

**NLU Service Tests** (`tests/nluService.test.js`):
- ✅ Text preprocessing
- ✅ Similarity calculation
- ✅ Parameter extraction
- ✅ Clarification logic

**Route Tests** (`tests/routes.test.js`):
- ✅ API endpoint responses
- ✅ Error handling
- ✅ Input validation
- ✅ CORS headers

## 📊 Performance

### Benchmarks

Tested on MacBook Pro M1:

| Operation | Time | Target |
|-----------|------|--------|
| Single Classification | ~50ms | <100ms |
| Batch (100 items) | ~3s | <5s |
| Parameter Extraction | ~10ms | <50ms |
| API Response (E2E) | ~80ms | <500ms |

### Optimization Tips

1. **Caching**: Cache frequent queries
2. **Batching**: Process multiple requests together
3. **Model Quantization**: Reduce model size (future ML)
4. **Connection Pooling**: Reuse DB connections (when added)

## 🔧 Development

### Adding a New Intent

1. **Add to `models/intentSchemas.js`:**
   ```javascript
   {
     id: "intent_026",
     name: "your_new_intent",
     description: "Description of intent",
     examples: ["example 1", "example 2", "example 3"],
     parameters: [],
     confidence_threshold: 0.75,
     response_type: "action_confirmation"
   }
   ```

2. **Add parameter extraction (if needed) in `services/nluService.js`:**
   ```javascript
   case 'your_new_intent':
     // Extract parameters
     break;
   ```

3. **Add tests in `tests/intents.test.js`:**
   ```javascript
   describe('Intent: your_new_intent', () => {
     test('should recognize example 1', () => {
       expectIntent('example 1', 'your_new_intent');
     });
   });
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

### Code Style

- **Comments**: JSDoc format for all functions
- **Naming**: camelCase for functions, snake_case for intents
- **Errors**: Always include descriptive error messages
- **Validation**: Validate all inputs

**Example:**
```javascript
/**
 * Classify user intent from input text
 *
 * @param {string} userInput - Raw user input text
 * @returns {Object} Classification result
 */
function classifyIntent(userInput) {
  // Implementation
}
```

## 🐛 Debugging

### Enable Debug Logging

Set `LOG_LEVEL=debug` in `.env`

### Common Issues

**Issue**: Tests failing with timeout
**Solution**: Increase timeout in `jest.config.js`

**Issue**: Classification accuracy low
**Solution**: Add more examples to intent schema

**Issue**: Parameters not extracted
**Solution**: Check regex patterns in `extractParameters()`

### Verbose Test Output

```bash
npm test -- --verbose
```

## 🚀 Deployment

### Production Build

1. Set environment variables
2. Install production dependencies only:
   ```bash
   npm install --production
   ```
3. Start server:
   ```bash
   NODE_ENV=production npm start
   ```

### Docker (Future)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables

**Required:**
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production/test)

**Optional:**
- `ALLOWED_ORIGINS`: CORS origins
- `WHISPER_API_KEY`: Whisper API key (future)
- `TTS_API_KEY`: TTS API key (future)
- `LOG_LEVEL`: Logging level (info/debug/error)

## 📚 Further Reading

- [Architecture Documentation](../docs/architecture.md)
- [Classifier Coherence Model](../coherence/classifier-coherence.md)
- [Voice Pipeline](../docs/voice-pipeline.md)

## 🤝 Contributing

See main [README](../README.md#contributing) for contribution guidelines.

---

**Questions?** Open an issue or check the [documentation](../docs/).
