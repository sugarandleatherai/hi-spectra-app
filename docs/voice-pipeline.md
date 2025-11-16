# Hi-Spectra Voice Pipeline

## Overview

The voice pipeline is the complete journey from user speech to system action. This document details each stage of the pipeline, the technologies involved, and how they integrate.

```
┌──────────────────────────────────────────────────────────────┐
│                     VOICE PIPELINE                           │
└──────────────────────────────────────────────────────────────┘

   USER SPEAKS
       ↓
[1] AUDIO CAPTURE ───────────────────┐
       ↓                              │ (Microphone, Audio Stream)
[2] WAKE WORD DETECTION              │
       ↓                              │
[3] SPEECH RECOGNITION (ASR) ────────┤
       ↓                              │ (Transcribed Text)
[4] TEXT PREPROCESSING               │
       ↓                              │
[5] INTENT CLASSIFICATION ───────────┤
       ↓                              │ (Intent + Confidence)
[6] PARAMETER EXTRACTION             │
       ↓                              │
[7] COHERENCE VALIDATION ────────────┤
       ↓                              │ (Action or Clarification)
[8] ACTION EXECUTION                 │
       ↓                              │
[9] RESPONSE GENERATION ─────────────┤
       ↓                              │ (Response Text)
[10] TEXT-TO-SPEECH (TTS)           │
       ↓                              │
   SYSTEM RESPONDS                    │
                                      │
   (FEEDBACK LOOP) ←──────────────────┘
```

## Stage 1: Audio Capture

### Purpose
Capture raw audio from the user's microphone.

### Technologies

**Web Audio API**:
```javascript
// Request microphone access
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,    // Remove echo
    noiseSuppression: true,    // Remove background noise
    autoGainControl: true      // Normalize volume
  }
});
```

**Audio Processing**:
- **Sample Rate**: 16kHz or 48kHz
- **Bit Depth**: 16-bit
- **Channels**: Mono (1 channel)
- **Format**: PCM WAV or Opus

### Configuration Options

| Setting | Value | Purpose |
|---------|-------|---------|
| `echoCancellation` | `true` | Removes echo from speakers |
| `noiseSuppression` | `true` | Reduces background noise |
| `autoGainControl` | `true` | Normalizes volume levels |
| `sampleRate` | `16000` | 16kHz sufficient for speech |

### Audio Visualization

Real-time waveform display using Canvas API:
```javascript
// Get frequency/time domain data
analyzer.getByteTimeDomainData(dataArray);

// Draw waveform
context.beginPath();
for (let i = 0; i < bufferLength; i++) {
  const v = dataArray[i] / 128.0;
  const y = (v * canvas.height) / 2;
  if (i === 0) context.moveTo(x, y);
  else context.lineTo(x, y);
  x += sliceWidth;
}
context.stroke();
```

## Stage 2: Wake Word Detection

### Purpose
Continuously monitor audio for wake phrases: "Hey Spectra" or "High Spectra"

### Current Implementation: Web Speech API

**Continuous Listening**:
```javascript
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;      // Keep listening
recognition.interimResults = true;  // Get partial results

recognition.onresult = (event) => {
  const transcript = event.results[last][0].transcript;

  if (containsWakeWord(transcript)) {
    onWakeWordDetected();
  }
};
```

**Wake Word Matching**:
```javascript
const wakeWords = ['hey spectra', 'high spectra'];

function containsWakeWord(transcript) {
  const lower = transcript.toLowerCase();
  return wakeWords.some(word => lower.includes(word));
}
```

### Future Implementation: Dedicated Wake Word Engine

**Option 1: Porcupine (Picovoice)**
- Local wake word detection
- Custom wake word training
- Low CPU usage
- Privacy-friendly (fully offline)

**Option 2: Snowboy (Deprecated but functional)**
- Custom wake word models
- Adjustable sensitivity
- Open source

**Option 3: Custom Model**
- Train TensorFlow.js model
- Tailored to specific use case
- Full control over sensitivity

### Wake Word Processing

1. **Audio Buffering**: Keep rolling buffer of last 3 seconds
2. **Feature Extraction**: Convert audio to MFCC (Mel-frequency cepstral coefficients)
3. **Model Inference**: Run through wake word detection model
4. **Threshold Check**: Compare confidence to sensitivity setting
5. **Trigger**: If above threshold, activate listening mode

### Performance Metrics

- **False Positive Rate**: <5% (trigger when no wake word)
- **False Negative Rate**: <10% (miss when wake word spoken)
- **Latency**: <300ms from speech to detection
- **CPU Usage**: <5% on modern processors

## Stage 3: Speech Recognition (ASR)

### Purpose
Convert spoken audio to text.

### Current Implementation: Web Speech API

**Benefits**:
✅ Built into Chrome/Edge (free)
✅ No API keys needed
✅ Supports multiple languages
✅ Continuous recognition
✅ Interim results (live transcription)

**Limitations**:
❌ Requires internet connection
❌ Limited control over model
❌ Privacy concerns (sends audio to Google)
❌ Not available in all browsers

**Configuration**:
```javascript
recognition.lang = 'en-US';           // Language
recognition.continuous = true;        // Keep listening
recognition.interimResults = true;    // Partial results
recognition.maxAlternatives = 1;      // Only best result
```

### Future Implementation: OpenAI Whisper

**Benefits**:
✅ State-of-the-art accuracy
✅ Multiple language support
✅ Works offline (local model)
✅ Punctuation and capitalization
✅ Open source

**Implementation**:
```javascript
// Using Whisper API
const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'multipart/form-data'
  },
  body: formData  // Audio file
});

const { text } = await response.json();
```

**Model Sizes**:
| Model | Size | Speed | Accuracy |
|-------|------|-------|----------|
| `tiny` | 75 MB | ~10x realtime | Good |
| `base` | 142 MB | ~7x realtime | Better |
| `small` | 466 MB | ~4x realtime | Great |
| `medium` | 1.5 GB | ~2x realtime | Excellent |
| `large` | 2.9 GB | ~1x realtime | Best |

### Alternative: Google Speech-to-Text

**Benefits**:
- High accuracy
- Streaming recognition
- Automatic punctuation
- Speaker diarization

**Cost**: ~$0.006 per 15 seconds

### ASR Output Format

```javascript
{
  "text": "what's the weather like today",
  "confidence": 0.92,
  "alternatives": [
    {
      "text": "what's the weather like today",
      "confidence": 0.92
    },
    {
      "text": "what's the weather look like today",
      "confidence": 0.81
    }
  ],
  "words": [
    {"word": "what's", "start": 0.0, "end": 0.3, "confidence": 0.95},
    {"word": "the", "start": 0.3, "end": 0.4, "confidence": 0.98},
    // ...
  ]
}
```

## Stage 4: Text Preprocessing

### Purpose
Normalize text for consistent classification.

### Steps

**1. Lowercase Conversion**
```javascript
"What's The Weather?" → "what's the weather?"
```

**2. Whitespace Normalization**
```javascript
"what's    the   weather" → "what's the weather"
```

**3. Punctuation Removal**
```javascript
"what's the weather?" → "whats the weather"
// Note: Preserve apostrophes in contractions initially
```

**4. ASR Error Correction (Future)**

Common substitutions:
| ASR Output | Correction | Context |
|------------|------------|---------|
| "to" | "two" | Numbers |
| "for" | "4" | Numbers |
| "ate" | "8" | Numbers |
| "their" | "there" | Location |

### Preprocessing Function

```javascript
function preprocessText(text) {
  return text
    .toLowerCase()              // Lowercase
    .trim()                     // Remove leading/trailing space
    .replace(/\s+/g, ' ')      // Multiple spaces → single space
    .replace(/[^\w\s']/g, '')  // Remove punctuation except apostrophes
    .replace(/\s+'/g, ' ')     // Clean apostrophes
    .replace(/'\s+/g, ' ');
}
```

## Stage 5: Intent Classification

### Purpose
Determine what the user wants to do.

### Current Implementation: Fuzzy String Matching

**Algorithm**:
1. For each intent:
   - For each example utterance:
     - Calculate similarity to user input
     - Boost if keywords present
   - Take max similarity
2. Return intent with highest similarity above threshold

**Levenshtein Distance**:
```javascript
function similarity(str1, str2) {
  const distance = levenshteinDistance(str1, str2);
  const longer = Math.max(str1.length, str2.length);
  return (longer - distance) / longer;
}

// "set timer" vs "set a timer" → similarity = 0.91
```

**Keyword Boosting**:
```javascript
const keywords = exampleUtterance.split(' ');
const containsKeywords = keywords.some(word =>
  word.length > 3 && userInput.includes(word)
);

if (containsKeywords) {
  similarity += 0.1;  // Boost by 10%
}
```

### Future Implementation: Transformer Model

**Option 1: Fine-tuned BERT**
```python
# Training
model = BertForSequenceClassification.from_pretrained(
  'bert-base-uncased',
  num_labels=25  # Number of intents
)

# Training on labeled examples
trainer.train()

# Inference
inputs = tokenizer(user_input, return_tensors="pt")
outputs = model(**inputs)
predicted_intent = torch.argmax(outputs.logits)
```

**Option 2: Few-Shot Learning with GPT**
```javascript
const prompt = `
Classify the following user input into one of these intents:
${intentList}

User input: "${userInput}"
Intent:
`;

const response = await openai.complete(prompt);
```

### Classification Output

```javascript
{
  "intent": {
    "id": "intent_003",
    "name": "get_weather",
    "description": "User requests weather information"
  },
  "confidence": 0.87,
  "alternatives": [
    {"intent": "get_forecast", "confidence": 0.42},
    {"intent": "get_temperature", "confidence": 0.31}
  ]
}
```

## Stage 6: Parameter Extraction

### Purpose
Extract entities/slots needed to execute the intent.

### Current Implementation: Regex & Keyword Extraction

**Time Duration Extraction**:
```javascript
// Match patterns like "10 minutes", "2 hours"
const patterns = [
  /(\d+)\s*(second|seconds|sec|s)/i,
  /(\d+)\s*(minute|minutes|min|m)/i,
  /(\d+)\s*(hour|hours|hr|h)/i
];

// Input: "set a timer for 10 minutes"
// Output: {value: 10, unit: "minutes"}
```

**Time Extraction**:
```javascript
// Match "7am", "7:30pm", "7 o'clock"
const patterns = [
  /(\d{1,2}):(\d{2})\s*(am|pm)?/i,
  /(\d{1,2})\s*(am|pm)/i,
  /(\d{1,2})\s*o'?clock/i
];

// Input: "set alarm for 7:30am"
// Output: "7:30am"
```

**Query Extraction**:
```javascript
// Remove command words to get query
const commandWords = ['search', 'look up', 'google', 'find'];

// Input: "search for pizza recipes"
// Output: "pizza recipes"
```

### Future Implementation: Named Entity Recognition (NER)

**spaCy (Python)**:
```python
import spacy

nlp = spacy.load("en_core_web_sm")
doc = nlp("Set a reminder to call John at 3pm tomorrow")

for ent in doc.ents:
    print(ent.text, ent.label_)
    # "John" - PERSON
    # "3pm" - TIME
    # "tomorrow" - DATE
```

**TensorFlow.js NER**:
```javascript
const model = await tf.loadLayersModel('ner-model.json');
const entities = extractEntities(text, model);

// Output:
// [
//   {type: "PERSON", value: "John", start: 21, end: 25},
//   {type: "TIME", value: "3pm", start: 29, end: 32},
//   {type: "DATE", value: "tomorrow", start: 33, end: 41}
// ]
```

### Parameter Validation

```javascript
function validateParameters(intent, params) {
  const errors = [];

  // Check required parameters
  for (const param of intent.parameters) {
    if (param.required && !params[param.name]) {
      errors.push(`Missing required parameter: ${param.name}`);
    }
  }

  // Validate ranges
  if (params.volume && (params.volume < 0 || params.volume > 100)) {
    errors.push("Volume must be between 0 and 100");
  }

  return {valid: errors.length === 0, errors};
}
```

## Stage 7: Coherence Validation

### Purpose
Ensure the classification is coherent and actionable.

### Coherence Scoring

```javascript
function calculateCoherence(classification) {
  // Confidence score (60% weight)
  const confidenceScore = classification.confidence * 0.6;

  // Parameter completeness (30% weight)
  const required = intent.parameters.filter(p => p.required);
  const provided = required.filter(p => params[p.name]);
  const completeness = provided.length / required.length || 1;
  const completenessScore = completeness * 0.3;

  // Validity (10% weight)
  const {valid} = validateParameters(intent, params);
  const validityScore = valid ? 0.1 : 0;

  return confidenceScore + completenessScore + validityScore;
}
```

### Decision Logic

```javascript
const coherence = calculateCoherence(classification);

if (coherence > 0.8) {
  // High coherence - execute immediately
  executeAction(classification);

} else if (coherence > 0.5) {
  // Medium coherence - confirm first
  const confirmation = `Did you mean to ${intent.description}?`;
  requestConfirmation(confirmation);

} else {
  // Low coherence - clarify or rephrase
  const clarification = getClarification(classification);
  requestClarification(clarification);
}
```

## Stage 8: Action Execution

### Purpose
Execute the classified intent.

### Action Types

**1. Information Retrieval**
```javascript
case 'get_weather':
  const weather = await fetchWeather(params.location);
  return `The weather is ${weather.temp}°F and ${weather.conditions}`;
```

**2. System Commands**
```javascript
case 'volume_control':
  if (params.action === 'up') {
    await increaseVolume(10);
  } else if (params.action === 'set') {
    await setVolume(params.level);
  }
  return `Volume ${params.action}`;
```

**3. State Changes**
```javascript
case 'set_timer':
  const timer = createTimer(params.duration);
  timers.push(timer);
  return `Timer set for ${params.duration.value} ${params.duration.unit}`;
```

**4. External API Calls**
```javascript
case 'search_web':
  const results = await searchAPI.query(params.query);
  return formatSearchResults(results);
```

## Stage 9: Response Generation

### Purpose
Create human-readable response.

### Response Types

**1. Acknowledgment**
```javascript
// Simple confirmation
"Timer set for 10 minutes."
"Alarm set for 7:00 AM."
```

**2. Data Response**
```javascript
// Structured information
"The current weather is 72°F and sunny."
"Today is Monday, January 16, 2025."
```

**3. Clarification Request**
```javascript
// Ask for missing info
"What time should I set the alarm for?"
"Who should I send the message to?"
```

**4. Error Message**
```javascript
// Handle errors gracefully
"I couldn't connect to the weather service. Please try again."
"I didn't quite catch that. Could you rephrase?"
```

### Response Templates

```javascript
const templates = {
  timer_set: "Timer set for {duration}. I'll notify you when it's done!",
  alarm_set: "Alarm set for {time}. I'll make sure to wake you up!",
  weather: "The weather is currently {temp}°F and {conditions}.",
  not_found: "I couldn't find {query}. Would you like to try a different search?"
};

function fillTemplate(template, params) {
  return template.replace(/{(\w+)}/g, (match, key) => params[key] || match);
}
```

## Stage 10: Text-to-Speech (TTS)

### Purpose
Convert response text to spoken audio.

### Current Implementation: Browser TTS (Future)

```javascript
const utterance = new SpeechSynthesisUtterance(responseText);
utterance.voice = voices.find(v => v.name === 'Google US English');
utterance.rate = 1.0;    // Speed
utterance.pitch = 1.0;   // Pitch
utterance.volume = 1.0;  // Volume

speechSynthesis.speak(utterance);
```

### Future Implementation: Cloud TTS

**Google Cloud TTS**:
```javascript
const response = await tts.synthesizeSpeech({
  input: {text: responseText},
  voice: {languageCode: 'en-US', name: 'en-US-Neural2-A'},
  audioConfig: {audioEncoding: 'MP3', pitch: 0, speakingRate: 1.0}
});

const audioData = response.audioContent;
playAudio(audioData);
```

**ElevenLabs (High Quality)**:
```javascript
const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/voice-id', {
  method: 'POST',
  headers: {'xi-api-key': apiKey},
  body: JSON.stringify({
    text: responseText,
    voice_settings: {stability: 0.5, similarity_boost: 0.75}
  })
});

const audioBlob = await response.blob();
playAudio(audioBlob);
```

## Feedback Loop

### Purpose
Improve system over time based on user interactions.

### Metrics Collected

1. **Classification Accuracy**
   - Did the intent match user's goal?
   - Was confidence score appropriate?

2. **Parameter Extraction**
   - Were entities correctly extracted?
   - Were there missing parameters?

3. **User Corrections**
   - Did user rephrase?
   - Did user cancel action?
   - Did user explicitly correct?

### Active Learning

```javascript
// When user corrects
userSays("set timer 10 minutes");
systemClassifies("set_alarm");  // WRONG

userCorrects("no, I said timer, not alarm");

// Log correction
logCorrection({
  input: "set timer 10 minutes",
  predicted: "set_alarm",
  actual: "set_timer",
  confidence: 0.65
});

// Use corrections to retrain model
```

## Performance Optimization

### Latency Budget

| Stage | Target | Max Acceptable |
|-------|--------|----------------|
| Wake Word Detection | <300ms | <500ms |
| Speech Recognition | <1s | <2s |
| Preprocessing | <10ms | <50ms |
| Classification | <100ms | <500ms |
| Parameter Extraction | <50ms | <200ms |
| Response Generation | <100ms | <500ms |
| **Total** | **<2s** | **<4s** |

### Optimization Techniques

**1. Caching**
```javascript
// Cache frequent queries
const cache = new Map();

if (cache.has(userInput)) {
  return cache.get(userInput);
}

const result = classifyIntent(userInput);
cache.set(userInput, result);
```

**2. Model Quantization**
- Reduce model size by 4x
- Minimal accuracy loss
- Faster inference

**3. Batching**
```javascript
// Process multiple requests together
const batch = collectBatch(100ms);  // Wait 100ms
const results = model.predict(batch);  // Process all at once
```

**4. Edge Computing**
- Run models locally when possible
- Reduce network latency
- Improve privacy

## Error Handling

### Retry Logic

```javascript
async function transcribeWithRetry(audio, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await transcribe(audio);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);  // Exponential backoff
    }
  }
}
```

### Graceful Degradation

```javascript
// If ASR fails, fall back to text input
if (asrError) {
  showMessage("Speech recognition failed. Please type your request.");
  enableTextInput();
}

// If backend fails, use local processing
if (backendError) {
  return localClassifier.classify(text);
}
```

---

**Last Updated**: 2025-01-16
**Version**: 1.0.0
**Maintainers**: Hi-Spectra Team
