/**
 * Intent Schemas for Hi-Spectra Voice Assistant
 *
 * This module defines the 25 core intents that the system can recognize and handle.
 * Each intent includes:
 * - id: Unique identifier
 * - name: Human-readable intent name
 * - description: What this intent represents
 * - examples: Sample utterances that should trigger this intent
 * - parameters: Expected entities/slots to extract
 * - confidence_threshold: Minimum confidence score to accept this classification
 *
 * @module intentSchemas
 * @author Hi-Spectra Team
 * @version 1.0.0
 */

const intentSchemas = [
  {
    id: "intent_001",
    name: "greeting",
    description: "User greets the assistant",
    examples: [
      "hello",
      "hi there",
      "hey Spectra",
      "good morning",
      "what's up"
    ],
    parameters: [],
    confidence_threshold: 0.7,
    response_type: "acknowledgment"
  },
  {
    id: "intent_002",
    name: "goodbye",
    description: "User ends the conversation",
    examples: [
      "goodbye",
      "see you later",
      "bye",
      "catch you later",
      "I'm done"
    ],
    parameters: [],
    confidence_threshold: 0.7,
    response_type: "farewell"
  },
  {
    id: "intent_003",
    name: "get_weather",
    description: "User requests weather information",
    examples: [
      "what's the weather like",
      "will it rain today",
      "temperature outside",
      "weather forecast for tomorrow",
      "is it sunny"
    ],
    parameters: [
      { name: "location", type: "string", required: false },
      { name: "date", type: "date", required: false }
    ],
    confidence_threshold: 0.75,
    response_type: "data"
  },
  {
    id: "intent_004",
    name: "set_timer",
    description: "User wants to set a timer",
    examples: [
      "set a timer for 10 minutes",
      "start a countdown for 5 minutes",
      "timer 30 seconds",
      "remind me in 2 hours",
      "wake me up in 15 minutes"
    ],
    parameters: [
      { name: "duration", type: "time_duration", required: true },
      { name: "label", type: "string", required: false }
    ],
    confidence_threshold: 0.8,
    response_type: "action_confirmation"
  },
  {
    id: "intent_005",
    name: "set_alarm",
    description: "User wants to set an alarm",
    examples: [
      "set an alarm for 7am",
      "wake me up at 6:30",
      "alarm for tomorrow morning",
      "set alarm 8 o'clock",
      "create alarm for noon"
    ],
    parameters: [
      { name: "time", type: "time", required: true },
      { name: "date", type: "date", required: false },
      { name: "label", type: "string", required: false }
    ],
    confidence_threshold: 0.8,
    response_type: "action_confirmation"
  },
  {
    id: "intent_006",
    name: "play_music",
    description: "User wants to play music",
    examples: [
      "play some music",
      "play jazz",
      "start my workout playlist",
      "play songs by the Beatles",
      "put on some chill music"
    ],
    parameters: [
      { name: "genre", type: "string", required: false },
      { name: "artist", type: "string", required: false },
      { name: "playlist", type: "string", required: false },
      { name: "song", type: "string", required: false }
    ],
    confidence_threshold: 0.75,
    response_type: "action_confirmation"
  },
  {
    id: "intent_007",
    name: "stop_media",
    description: "User wants to stop current media playback",
    examples: [
      "stop",
      "pause",
      "stop playing",
      "pause music",
      "turn it off"
    ],
    parameters: [],
    confidence_threshold: 0.7,
    response_type: "action_confirmation"
  },
  {
    id: "intent_008",
    name: "volume_control",
    description: "User wants to adjust volume",
    examples: [
      "turn up the volume",
      "make it louder",
      "volume down",
      "set volume to 50",
      "mute"
    ],
    parameters: [
      { name: "action", type: "enum", values: ["up", "down", "mute", "unmute", "set"], required: true },
      { name: "level", type: "number", min: 0, max: 100, required: false }
    ],
    confidence_threshold: 0.75,
    response_type: "action_confirmation"
  },
  {
    id: "intent_009",
    name: "get_time",
    description: "User asks for current time",
    examples: [
      "what time is it",
      "tell me the time",
      "current time",
      "what's the time",
      "time please"
    ],
    parameters: [
      { name: "timezone", type: "string", required: false }
    ],
    confidence_threshold: 0.8,
    response_type: "data"
  },
  {
    id: "intent_010",
    name: "get_date",
    description: "User asks for current date",
    examples: [
      "what's today's date",
      "what day is it",
      "tell me the date",
      "what's the date today",
      "current date"
    ],
    parameters: [],
    confidence_threshold: 0.8,
    response_type: "data"
  },
  {
    id: "intent_011",
    name: "search_web",
    description: "User wants to search for information online",
    examples: [
      "search for pizza recipes",
      "look up the capital of France",
      "google how to tie a tie",
      "find information about quantum physics",
      "search news about AI"
    ],
    parameters: [
      { name: "query", type: "string", required: true }
    ],
    confidence_threshold: 0.75,
    response_type: "data"
  },
  {
    id: "intent_012",
    name: "send_message",
    description: "User wants to send a message",
    examples: [
      "send a message to John",
      "text mom I'll be late",
      "message Sarah happy birthday",
      "send email to boss",
      "tell Mike I'm on my way"
    ],
    parameters: [
      { name: "recipient", type: "string", required: true },
      { name: "message", type: "string", required: true },
      { name: "medium", type: "enum", values: ["sms", "email", "chat"], required: false }
    ],
    confidence_threshold: 0.8,
    response_type: "action_confirmation"
  },
  {
    id: "intent_013",
    name: "make_call",
    description: "User wants to make a phone call",
    examples: [
      "call mom",
      "dial John's number",
      "phone the office",
      "call 555-1234",
      "ring Sarah"
    ],
    parameters: [
      { name: "contact", type: "string", required: true }
    ],
    confidence_threshold: 0.85,
    response_type: "action_confirmation"
  },
  {
    id: "intent_014",
    name: "create_reminder",
    description: "User wants to create a reminder",
    examples: [
      "remind me to buy milk",
      "create a reminder for the meeting",
      "don't let me forget to call John",
      "reminder to take medicine at 8pm",
      "add reminder for grocery shopping"
    ],
    parameters: [
      { name: "task", type: "string", required: true },
      { name: "time", type: "datetime", required: false },
      { name: "location", type: "string", required: false }
    ],
    confidence_threshold: 0.75,
    response_type: "action_confirmation"
  },
  {
    id: "intent_015",
    name: "add_calendar_event",
    description: "User wants to add an event to calendar",
    examples: [
      "add meeting to my calendar",
      "schedule dentist appointment for Friday",
      "create calendar event for lunch with Sarah",
      "book time for gym tomorrow",
      "add birthday party to calendar"
    ],
    parameters: [
      { name: "event_title", type: "string", required: true },
      { name: "date", type: "date", required: true },
      { name: "time", type: "time", required: false },
      { name: "duration", type: "time_duration", required: false },
      { name: "location", type: "string", required: false }
    ],
    confidence_threshold: 0.8,
    response_type: "action_confirmation"
  },
  {
    id: "intent_016",
    name: "get_directions",
    description: "User wants navigation directions",
    examples: [
      "how do I get to the airport",
      "directions to Central Park",
      "navigate home",
      "take me to the nearest coffee shop",
      "route to 123 Main Street"
    ],
    parameters: [
      { name: "destination", type: "string", required: true },
      { name: "mode", type: "enum", values: ["driving", "walking", "transit", "cycling"], required: false }
    ],
    confidence_threshold: 0.8,
    response_type: "data"
  },
  {
    id: "intent_017",
    name: "open_application",
    description: "User wants to open an application",
    examples: [
      "open Spotify",
      "launch Chrome",
      "start Word",
      "open my email",
      "run calculator"
    ],
    parameters: [
      { name: "app_name", type: "string", required: true }
    ],
    confidence_threshold: 0.8,
    response_type: "action_confirmation"
  },
  {
    id: "intent_018",
    name: "tell_joke",
    description: "User wants to hear a joke",
    examples: [
      "tell me a joke",
      "make me laugh",
      "say something funny",
      "got any jokes",
      "humor me"
    ],
    parameters: [
      { name: "category", type: "string", required: false }
    ],
    confidence_threshold: 0.75,
    response_type: "entertainment"
  },
  {
    id: "intent_019",
    name: "get_news",
    description: "User wants news updates",
    examples: [
      "what's in the news",
      "tell me the headlines",
      "news update",
      "what's happening in the world",
      "sports news"
    ],
    parameters: [
      { name: "category", type: "enum", values: ["general", "sports", "tech", "business", "entertainment"], required: false }
    ],
    confidence_threshold: 0.75,
    response_type: "data"
  },
  {
    id: "intent_020",
    name: "translate",
    description: "User wants to translate text",
    examples: [
      "translate hello to Spanish",
      "how do you say thank you in French",
      "what's good morning in German",
      "translate this to Italian",
      "say welcome in Japanese"
    ],
    parameters: [
      { name: "text", type: "string", required: true },
      { name: "target_language", type: "string", required: true },
      { name: "source_language", type: "string", required: false }
    ],
    confidence_threshold: 0.8,
    response_type: "data"
  },
  {
    id: "intent_021",
    name: "calculate",
    description: "User wants to perform a calculation",
    examples: [
      "what's 15 times 23",
      "calculate 100 divided by 4",
      "add 45 and 67",
      "what's the square root of 144",
      "convert 100 fahrenheit to celsius"
    ],
    parameters: [
      { name: "expression", type: "string", required: true }
    ],
    confidence_threshold: 0.8,
    response_type: "data"
  },
  {
    id: "intent_022",
    name: "get_definition",
    description: "User wants to know the definition of a word",
    examples: [
      "what does ephemeral mean",
      "define serendipity",
      "meaning of ubiquitous",
      "what is a paradox",
      "explain what augment means"
    ],
    parameters: [
      { name: "word", type: "string", required: true }
    ],
    confidence_threshold: 0.8,
    response_type: "data"
  },
  {
    id: "intent_023",
    name: "system_settings",
    description: "User wants to change system settings",
    examples: [
      "turn on bluetooth",
      "disable wifi",
      "enable dark mode",
      "adjust brightness",
      "turn off notifications"
    ],
    parameters: [
      { name: "setting", type: "string", required: true },
      { name: "action", type: "enum", values: ["enable", "disable", "toggle", "adjust"], required: true },
      { name: "value", type: "string", required: false }
    ],
    confidence_threshold: 0.8,
    response_type: "action_confirmation"
  },
  {
    id: "intent_024",
    name: "ask_capability",
    description: "User asks what the assistant can do",
    examples: [
      "what can you do",
      "help me",
      "what are your capabilities",
      "how can you help",
      "what features do you have"
    ],
    parameters: [],
    confidence_threshold: 0.7,
    response_type: "informational"
  },
  {
    id: "intent_025",
    name: "fallback",
    description: "Catch-all for unrecognized intents",
    examples: [
      "asdfghjkl",
      "mumble mumble",
      "uh um er"
    ],
    parameters: [],
    confidence_threshold: 0.0,
    response_type: "clarification"
  }
];

/**
 * Get all intent schemas
 * @returns {Array} Array of all intent schemas
 */
function getAllIntents() {
  return intentSchemas;
}

/**
 * Get intent by ID
 * @param {string} intentId - The intent ID to look up
 * @returns {Object|null} The intent schema or null if not found
 */
function getIntentById(intentId) {
  return intentSchemas.find(intent => intent.id === intentId) || null;
}

/**
 * Get intent by name
 * @param {string} intentName - The intent name to look up
 * @returns {Object|null} The intent schema or null if not found
 */
function getIntentByName(intentName) {
  return intentSchemas.find(intent => intent.name === intentName) || null;
}

/**
 * Validate if an intent classification meets the confidence threshold
 * @param {string} intentId - The classified intent ID
 * @param {number} confidence - The confidence score (0-1)
 * @returns {boolean} True if confidence meets threshold
 */
function validateConfidence(intentId, confidence) {
  const intent = getIntentById(intentId);
  if (!intent) return false;
  return confidence >= intent.confidence_threshold;
}

module.exports = {
  intentSchemas,
  getAllIntents,
  getIntentById,
  getIntentByName,
  validateConfidence
};
