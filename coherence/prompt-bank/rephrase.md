# Rephrase Prompts

## Purpose

Rephrase prompts are used when the system completely fails to understand the user's input. Unlike clarification prompts (which indicate partial understanding), rephrase prompts signal that the system needs the user to try again with different words.

## When to Use

Trigger rephrase prompts when:
- Intent classification confidence < 0.4
- Fallback intent is triggered
- Multiple consecutive failed classification attempts
- Input is too short, too garbled, or nonsensical
- ASR produced unintelligible output

## Design Principles

1. **Never Blame the User**: Phrase as system limitation, not user error
2. **Be Encouraging**: Make users feel safe to try again
3. **Provide Guidance**: Offer examples of successful inputs
4. **Stay Positive**: Maintain helpful, friendly tone
5. **Escalate Gracefully**: After 2-3 failures, offer different help

## Prompt Templates

### First Attempt (Gentle)

**Template**: `"I didn't quite catch that. Could you rephrase what you'd like me to do?"`

**Variations**:
- "I didn't quite understand. Mind saying that another way?"
- "Sorry, I missed that. Could you try again?"
- "I'm not sure what you mean. Can you rephrase that?"
- "Hmm, I didn't get that. Want to try rewording it?"

### Second Attempt (With Examples)

**Template**: `"I'm still having trouble understanding. Try something like: {example_1}, {example_2}, or {example_3}."`

**Examples**:
- "I'm still having trouble understanding. Try something like: 'What's the weather?', 'Set a timer for 10 minutes', or 'Play some music.'"
- "Let me help. Try phrases like: 'Call Mom', 'Remind me to buy milk', or 'What time is it?'"
- "I'm not getting it. Here are some things I understand: 'Search for pizza recipes', 'Turn up the volume', or 'Tell me a joke.'"

### Third Attempt (Escalation)

**Template**: `"I'm really sorry, I'm still not understanding. Would you like to: (1) see what I can do, (2) type instead of speak, or (3) try something else?"`

**Examples**:
- "I apologize, I'm still confused. Would you like to see a list of commands I understand?"
- "Let's try a different approach. You can type your request, ask 'what can you do?', or say 'help' for assistance."
- "I'm having a hard time with this. Say 'help' to see examples, or try typing your request instead."

### After Noisy Audio

**Template**: `"Sorry, there was background noise and I couldn't hear clearly. Could you try again?"`

**Variations**:
- "It was a bit noisy. Mind repeating that?"
- "I had trouble hearing that. Could you say it again?"
- "The audio was unclear. Can you try once more?"

### After ASR Failure

**Template**: `"I'm having trouble with speech recognition right now. Could you try speaking more slowly or typing instead?"`

**Variations**:
- "My hearing isn't great right now. Try speaking a bit slower?"
- "I missed that. Could you speak more clearly or type it out?"
- "Speech recognition is struggling. Mind typing or speaking slower?"

## Context-Aware Rephrasing

### After Failed Search/Lookup

If user tried to search but query was unintelligible:

```
"I want to search, but I didn't catch what to search for. Try: 'Search for [topic]' or 'Look up [query]'."
```

### After Failed Action Command

If user tried an action but it wasn't clear:

```
"I know you want me to do something, but I'm not sure what. Try: 'Set a timer', 'Play music', or 'Send a message'."
```

### After Failed Question

If user asked a question but it was garbled:

```
"I can tell you're asking a question. Try: 'What's the weather?', 'What time is it?', or 'What can you do?'."
```

## Response Patterns by Attempt Count

| Attempt | Strategy | Example |
|---------|----------|---------|
| 1st | Simple rephrase request | "I didn't catch that. Could you say it again?" |
| 2nd | Rephrase with examples | "Try something like: 'Set a timer' or 'What's the weather?'" |
| 3rd | Offer alternatives | "Would you like to type instead or see what I can do?" |
| 4th+ | Escalate to help mode | "Let me show you what I can help with..." |

## Tone Guidelines

### Casual & Friendly (Default)
```
"Oops, didn't get that. Try again?"
"Hmm, not sure I understood. Wanna rephrase?"
"My bad, I missed that. Say it another way?"
```

### Professional (Optional Mode)
```
"I apologize, I didn't understand that request."
"Could you please rephrase your question?"
"I'm unable to process that input. Please try again."
```

### Playful (Optional Mode)
```
"Whoops! That went over my head. Try again?"
"Brain freeze! Say that one more time?"
"Hmm, that's a new one. Can you put it differently?"
```

## What NOT to Say

### ❌ Avoid Blaming Language
- ~~"You're not making sense"~~
- ~~"That doesn't make any sense"~~
- ~~"Your input is invalid"~~
- ~~"Error: unrecognizable input"~~

### ❌ Avoid Technical Jargon
- ~~"Low confidence score"~~
- ~~"Intent classification failed"~~
- ~~"ASR transcription error"~~
- ~~"NLU pipeline exception"~~

### ❌ Avoid Frustration
- ~~"I told you I don't understand"~~
- ~~"This isn't working"~~
- ~~"Please speak clearly this time"~~
- ~~"Why can't you just..."~~

## Recovery Strategies

### Strategy 1: Simplification Prompt
```
"Let's start simple. Try saying just one or two words, like 'weather' or 'timer'."
```

### Strategy 2: Mode Switch
```
"Speech isn't working well right now. Want to type instead?"
```

### Strategy 3: Help Redirect
```
"Let me show you what I can do. Here are some examples..."
```

### Strategy 4: Partial Success
```
"I caught the word '{detected_keyword}'. Did you want to do something with that?"
```

## Example Interaction Flows

### Flow 1: Successful Recovery

```
User: [garbled audio]
System: "I didn't quite catch that. Could you rephrase what you'd like me to do?"
User: "Weather"
System: "The current weather is 72°F and sunny."
```

### Flow 2: Escalation to Examples

```
User: [unintelligible]
System: "I didn't quite catch that. Could you say it again?"
User: [still unclear]
System: "I'm still having trouble. Try something like: 'What's the weather?', 'Set a timer', or 'Play music'."
User: "What's the weather"
System: "The current weather is 72°F and sunny."
```

### Flow 3: Mode Switch

```
User: [noisy environment, repeated failures]
System: "There's a lot of background noise. Would you like to type your request instead?"
User: [switches to text mode]
User: "what's the weather"
System: "The current weather is 72°F and sunny."
```

### Flow 4: Help Redirect

```
User: [multiple failures]
System: "I'm really sorry, I'm not understanding. Would you like to see what I can do?"
User: "Yes"
System: "I can help with: weather, timers, alarms, music, calls, messages, and more. Try: 'What's the weather?' or 'Set a timer for 5 minutes'."
```

## Metrics to Track

Monitor these metrics to improve rephrase prompts:
- **Rephrase Rate**: % of conversations requiring rephrase
- **Recovery Success**: % of successful classifications after rephrase
- **Abandonment Rate**: % of users who quit after rephrase prompt
- **Attempts Before Success**: Average number of tries before understanding

**Target Goals**:
- Rephrase Rate: <15%
- Recovery Success: >70%
- Abandonment Rate: <5%
- Avg Attempts: <2

## A/B Testing Variations

Test different rephrase styles:

**Variation A (Direct)**:
```
"I didn't understand. Please rephrase."
```

**Variation B (Helpful)**:
```
"I didn't catch that. Try: 'Set a timer' or 'What's the weather?'"
```

**Variation C (Playful)**:
```
"Whoops! That went over my head. Say it another way?"
```

Measure which variation leads to:
- Higher recovery success
- Lower user frustration
- Better task completion

---

**Last Updated**: 2025-01-16
**Version**: 1.0.0
**Maintainer**: Hi-Spectra Team
