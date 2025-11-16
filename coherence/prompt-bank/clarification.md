# Clarification Prompts

## Purpose

Clarification prompts are used when the system needs additional information from the user to complete an action. This happens when:
- Required parameters are missing
- Intent confidence is low but not at fallback level
- Multiple possible interpretations exist

## Design Principles

1. **Be Specific**: Ask for exactly what's needed
2. **Be Concise**: Keep prompts short and to the point
3. **Be Helpful**: Provide examples or options when appropriate
4. **Be Natural**: Use conversational language
5. **Be Patient**: Never make the user feel wrong or stupid

## Prompt Templates

### Missing Required Parameter

**Template**: `"I understand you want to {intent_description}, but I need to know {parameter_name}. {example}"`

**Examples**:
- "I understand you want to set an alarm, but I need to know what time. For example, 'set an alarm for 7:30 AM.'"
- "I'd like to send a message for you, but who should I send it to?"
- "I can search for that, but what exactly would you like me to look for?"

### Low Confidence Classification

**Template**: `"Did you mean to {intent_description}? {alternative_suggestion}"`

**Examples**:
- "Did you mean to set a timer? If not, could you rephrase that?"
- "It sounds like you want to know the weather. Is that right?"
- "Are you trying to play music or pause the current song?"

### Ambiguous Input

**Template**: `"I can do that in a couple of ways: {option_1} or {option_2}. Which would you prefer?"`

**Examples**:
- "I can do that in a couple of ways: set a timer to remind you in 10 minutes, or call someone in 10 minutes. Which would you prefer?"
- "Do you want me to search the web or look in your local files?"
- "Should I play music from Spotify or Apple Music?"

### Parameter Validation Failed

**Template**: `"I heard {parameter_value}, but that doesn't seem right. {explanation}"`

**Examples**:
- "I heard you say 300 minutes, but that seems like a long time for a timer. Did you mean 30 minutes?"
- "The time you mentioned doesn't exist. Could you try again?"
- "I couldn't find a contact named 'Blargh'. Did you mean 'Blake' or 'Bart'?"

### Out-of-Scope Request

**Template**: `"I'm not sure I can help with that, but I can {alternative_capability}."`

**Examples**:
- "I'm not sure I can help with that, but I can search the web for information."
- "That's beyond my current abilities, but I can set a reminder for you to do it manually."
- "I can't control your smart home devices yet, but I can add that to my feature roadmap."

## Intent-Specific Clarifications

### set_timer / set_alarm
- Missing duration: "How long should the timer be?"
- Missing time: "What time should I set the alarm for?"
- Ambiguous: "Do you want a timer (countdown) or an alarm (specific time)?"

### play_music
- No specification: "What would you like me to play?"
- Ambiguous genre: "I found several types of jazz. Which do you prefer: smooth jazz, bebop, or modern jazz?"
- Service selection: "Would you like to play from Spotify, Apple Music, or local files?"

### send_message
- Missing recipient: "Who should I send this message to?"
- Missing message: "What should the message say?"
- Ambiguous medium: "Should I send this as a text message or an email?"

### search_web
- Too vague: "Could you be more specific about what you're searching for?"
- Missing query: "What would you like me to search for?"

### get_directions
- Missing destination: "Where would you like to go?"
- Multiple matches: "I found 3 coffee shops nearby. Which one: Starbucks on Main, Java Hut on Elm, or Coffee Co on Oak?"
- Mode clarification: "How are you traveling: driving, walking, or public transit?"

### system_settings
- Ambiguous setting: "Which setting would you like to change?"
- Invalid value: "That value isn't valid for this setting. Try a number between 0 and 100."

## Response Flow Examples

### Example 1: Missing Parameter Recovery

```
User: "Set an alarm"
System: "What time should I set the alarm for?"
User: "7 AM"
System: "Alarm set for 7:00 AM tomorrow."
```

### Example 2: Ambiguity Resolution

```
User: "Call in 10 minutes"
System: "I can do that in a couple of ways: set a timer to remind you in 10 minutes, or call someone in 10 minutes. Which would you prefer?"
User: "Set a timer"
System: "Timer set for 10 minutes."
```

### Example 3: Low Confidence Confirmation

```
User: "What's the time?" [noisy audio, heard as "What's the time"]
System: [85% confidence] "The current time is 3:45 PM."

User: "What's the lime?" [ASR error]
System: [60% confidence] "Did you mean to ask for the time? If not, could you rephrase that?"
User: "Yes, the time"
System: "The current time is 3:45 PM."
```

### Example 4: Parameter Correction

```
User: "Set a timer for 300 minutes"
System: "I heard you say 300 minutes, but that seems like a long time for a timer. Did you mean 30 minutes or 3 minutes?"
User: "Oh, 30 minutes"
System: "Timer set for 30 minutes."
```

## Best Practices

### DO
✅ Keep prompts under 20 words when possible
✅ Offer concrete examples
✅ Provide 2-3 options max (avoid overwhelming)
✅ Use positive language ("I can help with..." vs "I can't...")
✅ Acknowledge what you DID understand

### DON'T
❌ Use technical jargon ("parameter", "intent", "confidence")
❌ Blame the user ("You didn't specify...")
✅ Make assumptions - always confirm
❌ Repeat the exact same prompt multiple times
❌ Ask more than one question at a time

## Conversation Context

When multiple clarifications are needed, maintain context:

**Bad**:
```
System: "What time?"
User: "7 AM"
System: "7 AM for what?"  // User forgot context
```

**Good**:
```
System: "What time should I set the alarm for?"
User: "7 AM"
System: "Alarm set for 7:00 AM."  // Clear context maintained
```

## Escalation

After 3 failed clarification attempts, escalate:

```
System: "I'm having trouble understanding. Let me show you some examples of what I can do:
- 'Set a timer for 10 minutes'
- 'What's the weather today?'
- 'Play some jazz music'

Try one of these, or say 'help' for more options."
```

## Testing Clarification Prompts

All prompts should be tested for:
- **Clarity**: Do users understand what's being asked?
- **Brevity**: Can it be said in <3 seconds?
- **Helpfulness**: Does it guide users to success?
- **Tone**: Is it friendly and patient?

---

**Last Updated**: 2025-01-16
**Version**: 1.0.0
**Maintainer**: Hi-Spectra Team
