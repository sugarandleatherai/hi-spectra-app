# Hi-Spectra User Flow

## Overview

This document describes the complete user experience and interaction flows for the Hi-Spectra voice assistant application.

## User Personas

### Primary Persona: Tech-Savvy Professional
- **Name**: Alex
- **Age**: 28-45
- **Use Case**: Productivity enhancement, hands-free computing
- **Comfort Level**: High with technology, values efficiency
- **Primary Mode**: Voice with occasional text fallback

### Secondary Persona: Accessibility User
- **Name**: Jordan
- **Age**: 35-60
- **Use Case**: Hands-free operation due to accessibility needs
- **Comfort Level**: Variable, needs clear instructions
- **Primary Mode**: Voice-only when possible

## Onboarding Flow

### First Launch

```
┌─────────────────────────────────┐
│   Hi-Spectra App Launches       │
└───────────────┬─────────────────┘
                │
                ↓
┌─────────────────────────────────┐
│  Permission Request: Microphone  │
│  "Hi-Spectra needs access to    │
│   your microphone for voice     │
│   recognition"                  │
│                                 │
│  [Allow]  [Deny]               │
└───────────┬─────────────────────┘
            │
    ┌───────┴────────┐
    │                │
Allow│                │Deny
    ↓                ↓
┌────────────┐  ┌─────────────┐
│ Welcome    │  │ Text-Only   │
│ Tutorial   │  │ Mode        │
└────────────┘  └─────────────┘
```

**Welcome Screen** (if microphone allowed):
```
╔═══════════════════════════════════════╗
║        Welcome to Hi-Spectra!         ║
╟───────────────────────────────────────╢
║                                       ║
║  I can help with:                     ║
║  • Weather & time                     ║
║  • Timers & alarms                    ║
║  • Music playback                     ║
║  • Web searches                       ║
║  • And more!                          ║
║                                       ║
║  Try saying:                          ║
║  "Hey Spectra, what's the weather?"   ║
║                                       ║
║  [Get Started]                        ║
╚═══════════════════════════════════════╝
```

### Initial Setup

1. User clicks "Get Started"
2. App shows brief tutorial (3 slides):
   - Slide 1: Wake words ("Hey Spectra" or "High Spectra")
   - Slide 2: Push-to-talk (Ctrl+Shift+Space)
   - Slide 3: Text input option
3. User can skip or complete tutorial
4. Main interface appears

## Primary Interaction Modes

### Mode 1: Wake Word (Hands-Free)

**User Goal**: Use voice assistant without touching keyboard/mouse

**Flow**:
```
User speaks: "Hey Spectra"
    ↓
Wake word detected (visual pulse animation)
    ↓
App: "Listening..." (indicator turns red)
    ↓
User continues: "What's the weather?"
    ↓
Processing... (shows thinking state)
    ↓
Response displayed and spoken (future TTS)
    ↓
Returns to listening for wake word
```

**Visual Feedback**:
- **Idle**: Blue waveform, "Ready" status
- **Wake word detected**: Red pulse, "Listening..." status
- **Processing**: Spinner, "Processing..." status
- **Responding**: Green indicator, response text

**Example Interaction**:
```
User: "Hey Spectra, set a timer for 10 minutes"

[Visual: Pulse animation]
[Status: Listening...]

[User message appears]:
👤 "Set a timer for 10 minutes"

[Status: Processing...]

[Assistant response]:
🤖 "Timer set for 10 minutes. I'll notify you when it's done!"

[Status: Ready]
```

### Mode 2: Push-to-Talk

**User Goal**: Avoid accidental wake word triggers, precise control

**Flow**:
```
User presses: Ctrl+Shift+Space (or clicks button)
    ↓
App: "Listening..." (button turns red)
    ↓
User speaks: "What time is it?"
    ↓
User releases button
    ↓
Processing...
    ↓
Response displayed
    ↓
Returns to ready state
```

**Button States**:
- **Normal**: Green, "Push to Talk"
- **Active**: Red, pulsing, "Listening..."
- **Processing**: Gray, "Processing..."

**Example Interaction**:
```
[User holds Ctrl+Shift+Space]

[Button glows red, waveform animates]

User: "Play some jazz music"

[User releases button]

[User message]:
👤 "Play some jazz music"

[Processing...]

[Assistant response]:
🤖 "Playing jazz music... (This would start music in production)"
```

### Mode 3: Text Input

**User Goal**: Precise input, noisy environment, privacy

**Flow**:
```
User types in text box: "search for pizza recipes"
    ↓
User presses Enter or clicks Send
    ↓
Processing...
    ↓
Response displayed
    ↓
Text box clears, ready for next input
```

**Example Interaction**:
```
[User types]: "remind me to call mom at 5pm"
[Presses Enter]

[User message]:
👤 "Remind me to call mom at 5pm"

[Processing...]

[Assistant response]:
🤖 "Reminder set: Call mom at 5:00 PM today. I'll notify you!"
```

## Common User Scenarios

### Scenario 1: Morning Routine

**Context**: User wakes up, wants quick information

```
Time: 7:00 AM
Location: Home

User: "Hey Spectra, good morning"
App:  "Good morning! How can I help you today?"

User: "What's the weather?"
App:  "It's currently 45°F and cloudy. High of 52°F today."

User: "Set an alarm for 7:30"
App:  "Alarm set for 7:30 AM. That's 30 minutes from now."

User: "Thanks"
App:  "You're welcome! Have a great day!"
```

### Scenario 2: Cooking with Voice

**Context**: User's hands are dirty from cooking, needs timer

```
Time: 6:30 PM
Location: Kitchen

User: "Hey Spectra, set a timer for 15 minutes"
App:  "Timer set for 15 minutes. I'll let you know when it's done!"

[15 minutes later]

App:  "⏰ Timer finished! Your 15 minutes are up."

User: "Thanks! Set another for 10 minutes"
App:  "Timer set for 10 minutes."
```

### Scenario 3: Working at Desk

**Context**: User working on computer, wants to avoid disturbing others

```
Time: 2:00 PM
Location: Office (shared space)

[User uses Push-to-Talk to avoid wake word]

[Holds Ctrl+Shift+Space]
User: (quietly) "What's 15 percent of 240"
[Releases]

App:  "15% of 240 is 36."

[User continues working]

[Later, wants to be even quieter]
[Types]: "define ubiquitous"

App:  "Ubiquitous means present, appearing, or found everywhere.
       Example: 'Smartphones have become ubiquitous in modern society.'"
```

### Scenario 4: Multitasking

**Context**: User doing multiple tasks, needs quick info

```
User: "Hey Spectra, what time is it?"
App:  "The current time is 3:45 PM."

User: "Set a timer for 5 minutes"
App:  "Timer set for 5 minutes."

User: "What's the weather tomorrow?"
App:  "Tomorrow will be sunny with a high of 68°F."

User: "Remind me to call John at 4 PM"
App:  "Reminder set: Call John at 4:00 PM today."
```

## Error Recovery Flows

### Flow 1: Didn't Understand

```
User: "Hey Spectra, blah blah mumble"

App:  "I didn't quite catch that. Could you rephrase what you'd like me to do?"

User: "What's the weather?"

App:  "The current weather is 62°F and partly cloudy."
```

### Flow 2: Missing Information

```
User: "Hey Spectra, set an alarm"

App:  "What time should I set the alarm for?"

User: "7 AM"

App:  "Alarm set for 7:00 AM tomorrow."
```

### Flow 3: Noisy Environment

```
User: "Hey Spectra" [background noise]

App:  [No wake word detected]

User: [Holds push-to-talk button]
      "What's the time?"

App:  "The current time is 4:30 PM."
```

### Flow 4: Out of Scope

```
User: "Hey Spectra, make me a sandwich"

App:  "I can't make sandwiches (yet!), but I can:
       • Search for sandwich recipes
       • Set a timer for cooking
       • Find nearby delis

       What would you like me to do?"

User: "Search for sandwich recipes"

App:  "I'd search for sandwich recipes, but web search isn't fully
       implemented yet. Coming soon!"
```

## Settings and Customization

### Accessing Settings

```
[User clicks gear icon in bottom right]

Settings panel slides in from right:

╔════════════════════════════════╗
║          Settings              ║
╠════════════════════════════════╣
║                                ║
║ Wake Word Sensitivity: ●───    ║
║                       70%      ║
║                                ║
║ Backend URL:                   ║
║ [http://localhost:3000]        ║
║                                ║
║ ☑ Auto-send after wake word    ║
║ ☐ Show confidence scores       ║
║                                ║
║ [Save Settings]                ║
╚════════════════════════════════╝
```

### Customization Options

**Wake Word Sensitivity**:
- Low (30-50%): Less false positives, may miss some wake words
- Medium (50-70%): Balanced (default)
- High (70-100%): More responsive, may have false positives

**Display Options**:
- Show confidence scores (for debugging)
- Show intent names (for debugging)
- Dark/light theme (future)

**Behavior Options**:
- Auto-send after wake word (vs. wait for confirmation)
- Continuous conversation mode (vs. one-shot)
- TTS voice selection (future)

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Shift + Space` | Push-to-talk (hold) |
| `Ctrl/Cmd + Shift + W` | Toggle wake word on/off |
| `Ctrl/Cmd + /` | Focus text input |
| `Ctrl/Cmd + ,` | Open settings |
| `Esc` | Close settings/cancel |
| `Enter` | Send text input |

## Accessibility Features

### Screen Reader Support
- All buttons have ARIA labels
- Status changes announced
- Conversation messages announced

### Keyboard Navigation
- Tab through all interactive elements
- Keyboard shortcuts for main actions
- No mouse required for basic operation

### Visual Indicators
- High contrast mode available
- Large text option
- Color-blind friendly palette
- Visual feedback for all audio events

### Voice-Only Mode
- Disable text input requirement
- Voice confirmation instead of clicking
- Audio feedback for all actions

## Conversation History

**Current**: Shown in scrollable conversation area
**Future**:
- Persistent history across sessions
- Search conversation history
- Export conversations
- Clear history option

## Tips for Best Experience

### Voice Input
✅ **DO**:
- Speak naturally, at normal pace
- Use wake word clearly: "Hey Spectra" or "High Spectra"
- Pause briefly after wake word
- State full request: "Set a timer for 10 minutes"

❌ **DON'T**:
- Speak too fast or slow
- Mumble or whisper (unless in push-to-talk)
- Use overly complex sentences
- Expect it to understand jargon

### Environment
- **Quiet**: Best performance
- **Moderate noise**: Use push-to-talk
- **Loud/public**: Use text input

### Commands
- **Be specific**: "Set timer for 10 minutes" vs. "Timer"
- **Use keywords**: "Weather", "Set", "Play", "Search"
- **Break complex tasks**: Multiple simple commands vs. one complex

## User Feedback Mechanisms

### Implicit Feedback
- If user repeats/rephrases: Likely didn't understand
- If user cancels: Wrong action taken
- If user switches to text: Voice recognition issues

### Explicit Feedback (Future)
- Thumbs up/down on responses
- "That's wrong" corrections
- Report bug button
- Feature request form

## Metrics Tracked (Privacy-Respecting)

**Anonymous Usage Data**:
- Most common intents
- Error rates by intent
- Average response time
- Feature usage (wake word vs. push-to-talk vs. text)

**NOT Tracked**:
- Actual conversation content
- Personal information
- Location (unless explicitly shared)
- User identification

---

**Last Updated**: 2025-01-16
**Version**: 1.0.0
**Maintainers**: Hi-Spectra Team
