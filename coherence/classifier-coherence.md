# Intent Coherence Model

## Overview

The Intent Coherence Model is the core component of Hi-Spectra's Natural Language Understanding (NLU) pipeline. It ensures that user inputs are correctly interpreted and mapped to actionable intents, even when the input is noisy, ambiguous, or poorly articulated.

## Purpose

Voice assistants face unique challenges:
- **Noisy Input**: Background noise, accents, and speech recognition errors
- **Ambiguity**: Multiple possible interpretations of the same phrase
- **Context Dependency**: User intent may depend on conversation history
- **Incomplete Information**: Users may omit required parameters

The coherence model addresses these challenges by:
1. **Cleaning** raw input (text or transcribed speech)
2. **Classifying** input into one of the defined intents
3. **Extracting** required parameters/entities
4. **Validating** that the classification is coherent and actionable
5. **Requesting clarification** when confidence is low or information is missing

## Architecture

```
User Input (Speech/Text)
    ↓
[Preprocessing]
    ↓
[Intent Classification]
    ↓
[Parameter Extraction]
    ↓
[Coherence Validation]
    ↓
[Clarification/Action]
```

### 1. Preprocessing

**Goal**: Normalize input for consistent classification

**Steps**:
- Convert to lowercase
- Remove extra whitespace
- Strip punctuation (preserving contractions)
- Normalize common substitutions (ASR errors)
  - "to" ↔ "2", "too"
  - "for" ↔ "4"
  - "you" ↔ "u"

**Example**:
- Input: `"  Hey, what's THE weather?!? "`
- Output: `"hey whats the weather"`

### 2. Intent Classification

**Current Approach**: Fuzzy string matching with confidence scoring

The classifier compares preprocessed input against example utterances for each intent using:
- **Levenshtein Distance**: Edit distance between strings
- **Keyword Boosting**: Presence of key terms increases confidence
- **Threshold Filtering**: Only accept classifications above confidence threshold

**Algorithm**:
```javascript
for each intent:
    max_similarity = 0
    for each example in intent.examples:
        sim = similarity(user_input, example)
        if contains_keywords(user_input, example):
            sim += 0.1  // boost
        max_similarity = max(max_similarity, sim)

    if max_similarity > intent.threshold:
        candidates.push({intent, confidence: max_similarity})

return highest_confidence(candidates)
```

**Future Enhancement**: Replace with ML-based classifier
- Fine-tuned BERT or similar transformer model
- Custom trained on domain-specific data
- Active learning from user corrections

### 3. Parameter Extraction

**Goal**: Extract entities/slots required for intent execution

**Techniques**:
- **Regex Patterns**: For structured data (times, dates, numbers)
- **Keyword Extraction**: For open-ended parameters (search queries)
- **Named Entity Recognition (NER)**: For people, places, organizations (future)

**Examples**:

| Intent | Input | Extracted Parameters |
|--------|-------|---------------------|
| `set_timer` | "set a timer for 10 minutes" | `{duration: {value: 10, unit: "minutes"}}` |
| `set_alarm` | "wake me up at 7:30am" | `{time: "7:30am"}` |
| `search_web` | "search for pizza recipes" | `{query: "pizza recipes"}` |

### 4. Coherence Validation

**Goal**: Ensure the classification is actionable

**Checks**:
1. **Confidence Threshold**: Is confidence score above minimum?
2. **Required Parameters**: Are all required parameters present?
3. **Parameter Validity**: Are parameters in valid format/range?
4. **Contextual Consistency**: Does this make sense given conversation history? (future)

**Coherence Score** = `(confidence × 0.6) + (param_completeness × 0.3) + (validity × 0.1)`

**Decision**:
- **High Coherence (>0.8)**: Execute action
- **Medium Coherence (0.5-0.8)**: Request confirmation
- **Low Coherence (<0.5)**: Request clarification/rephrase

### 5. Clarification Handling

When coherence is low, the system uses prompts from the **Prompt Bank** to:
- Ask for clarification (see `prompt-bank/clarification.md`)
- Request rephrase (see `prompt-bank/rephrase.md`)
- Provide grounding/context (see `prompt-bank/grounding.md`)

## Confidence Thresholds by Intent

Different intents require different confidence levels:

| Intent Type | Threshold | Reasoning |
|-------------|-----------|-----------|
| **High-Risk Actions** | 0.85 | Making calls, sending messages - mistakes are costly |
| **Medium-Risk Actions** | 0.75-0.80 | Setting alarms, timers - some tolerance for error |
| **Low-Risk Queries** | 0.70 | Weather, time, definitions - easy to recover from mistakes |
| **Fallback** | 0.00 | Always accepts unknown inputs |

## Handling Edge Cases

### Case 1: Multiple Possible Intents

Input: `"Call me in 10 minutes"`

Could be:
- `set_timer` (call = remind)
- `make_call` + `set_timer` (call someone, with delay)

**Solution**: Use contextual signals
- Previous conversation history
- User preferences
- Prompt for clarification if ambiguous

### Case 2: Partial Information

Input: `"Set an alarm"`

Missing: Time parameter (required)

**Solution**: Prompt for missing information
- "What time should I set the alarm for?"
- Continue conversation to gather parameters

### Case 3: ASR Errors

Input (transcribed): `"Play muse sick"` (user said "play music")

**Solution**:
- Use phonetic similarity in matching
- Maintain dictionary of common ASR errors
- Boost confidence for known substitutions

### Case 4: Out-of-Domain Requests

Input: `"What's the meaning of life?"`

No matching intent (philosophical question)

**Solution**:
- Trigger `fallback` intent
- Use grounding prompt to explain capabilities
- Offer alternative commands

## Metrics and Evaluation

**Key Performance Indicators**:
1. **Classification Accuracy**: % of correct intent classifications
2. **Parameter Extraction Accuracy**: % of correct entity extractions
3. **Clarification Rate**: % of interactions requiring clarification
4. **User Satisfaction**: Explicit feedback or conversation success

**Target Metrics** (v1.0):
- Classification Accuracy: >85%
- Parameter Accuracy: >80%
- Clarification Rate: <20%
- False Positive Rate: <5%

## Future Improvements

### Short-term (v1.1)
- [ ] Add conversation context tracking
- [ ] Implement parameter validation rules
- [ ] Create user correction feedback loop

### Medium-term (v2.0)
- [ ] Replace fuzzy matching with ML classifier
- [ ] Add Named Entity Recognition (NER)
- [ ] Implement active learning from user corrections
- [ ] Multi-turn dialogue management

### Long-term (v3.0)
- [ ] Personalized intent models per user
- [ ] Multi-language support
- [ ] Emotion/sentiment awareness
- [ ] Proactive suggestions based on patterns

## References

- [Intent Classification Best Practices](https://rasa.com/docs/rasa/nlu-training-data/)
- [Fuzzy String Matching](https://en.wikipedia.org/wiki/Levenshtein_distance)
- [Named Entity Recognition](https://en.wikipedia.org/wiki/Named-entity_recognition)
- [Dialogue State Tracking](https://arxiv.org/abs/1907.00456)

---

**Last Updated**: 2025-01-16
**Version**: 1.0.0
**Maintainer**: Hi-Spectra Team
