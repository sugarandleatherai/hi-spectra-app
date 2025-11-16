/**
 * Intent Classification Tests
 *
 * Comprehensive test suite for all 25 intents.
 * Tests classification accuracy, confidence scores, and parameter extraction.
 *
 * @module tests/intents
 * @author Hi-Spectra Team
 * @version 1.0.0
 */

const { classifyIntent } = require('../services/nluService');
const { getAllIntents } = require('../models/intentSchemas');

describe('Intent Classification', () => {
  /**
   * Helper function to test intent classification
   * @param {string} input - User input to classify
   * @param {string} expectedIntent - Expected intent name
   * @param {number} minConfidence - Minimum expected confidence
   */
  function expectIntent(input, expectedIntent, minConfidence = 0.7) {
    const result = classifyIntent(input);

    expect(result).toBeDefined();
    expect(result.intent).toBeDefined();
    expect(result.intent.name).toBe(expectedIntent);
    expect(result.confidence).toBeGreaterThanOrEqual(minConfidence);
  }

  /**
   * Test Suite 1: Greeting Intent
   */
  describe('Intent: greeting', () => {
    test('should recognize "hello"', () => {
      expectIntent('hello', 'greeting');
    });

    test('should recognize "hi there"', () => {
      expectIntent('hi there', 'greeting');
    });

    test('should recognize "hey Spectra"', () => {
      expectIntent('hey Spectra', 'greeting');
    });

    test('should recognize "good morning"', () => {
      expectIntent('good morning', 'greeting');
    });

    test('should recognize variations', () => {
      expectIntent('hi', 'greeting');
      expectIntent('hello there', 'greeting');
      expectIntent('hey', 'greeting');
    });
  });

  /**
   * Test Suite 2: Goodbye Intent
   */
  describe('Intent: goodbye', () => {
    test('should recognize "goodbye"', () => {
      expectIntent('goodbye', 'goodbye');
    });

    test('should recognize "see you later"', () => {
      expectIntent('see you later', 'goodbye');
    });

    test('should recognize "bye"', () => {
      expectIntent('bye', 'goodbye');
    });

    test('should recognize "catch you later"', () => {
      expectIntent('catch you later', 'goodbye');
    });
  });

  /**
   * Test Suite 3: Get Weather Intent
   */
  describe('Intent: get_weather', () => {
    test('should recognize "what\'s the weather like"', () => {
      expectIntent('what\'s the weather like', 'get_weather', 0.75);
    });

    test('should recognize "will it rain today"', () => {
      expectIntent('will it rain today', 'get_weather', 0.75);
    });

    test('should recognize "temperature outside"', () => {
      expectIntent('temperature outside', 'get_weather', 0.75);
    });

    test('should recognize "weather forecast for tomorrow"', () => {
      expectIntent('weather forecast for tomorrow', 'get_weather', 0.75);
    });

    test('should recognize variations', () => {
      expectIntent('whats the weather', 'get_weather', 0.75);
      expectIntent('hows the weather', 'get_weather', 0.6);
    });
  });

  /**
   * Test Suite 4: Set Timer Intent
   */
  describe('Intent: set_timer', () => {
    test('should recognize "set a timer for 10 minutes"', () => {
      const result = classifyIntent('set a timer for 10 minutes');
      expect(result.intent.name).toBe('set_timer');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      expect(result.parameters.duration).toBeDefined();
      expect(result.parameters.duration.value).toBe(10);
      expect(result.parameters.duration.unit).toMatch(/minute/i);
    });

    test('should recognize "start a countdown for 5 minutes"', () => {
      expectIntent('start a countdown for 5 minutes', 'set_timer', 0.6);
    });

    test('should recognize "timer 30 seconds"', () => {
      const result = classifyIntent('timer 30 seconds');
      expect(result.intent.name).toBe('set_timer');
      expect(result.parameters.duration).toBeDefined();
      expect(result.parameters.duration.value).toBe(30);
    });

    test('should extract duration parameters', () => {
      const testCases = [
        { input: 'set timer for 2 hours', expectedValue: 2, expectedUnit: 'hour' },
        { input: 'timer 45 seconds', expectedValue: 45, expectedUnit: 'second' },
        { input: 'set a timer for 15 min', expectedValue: 15, expectedUnit: 'min' }
      ];

      testCases.forEach(({ input, expectedValue, expectedUnit }) => {
        const result = classifyIntent(input);
        expect(result.intent.name).toBe('set_timer');
        expect(result.parameters.duration).toBeDefined();
        expect(result.parameters.duration.value).toBe(expectedValue);
        expect(result.parameters.duration.unit).toMatch(new RegExp(expectedUnit, 'i'));
      });
    });
  });

  /**
   * Test Suite 5: Set Alarm Intent
   */
  describe('Intent: set_alarm', () => {
    test('should recognize "set an alarm for 7am"', () => {
      const result = classifyIntent('set an alarm for 7am');
      expect(result.intent.name).toBe('set_alarm');
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
      expect(result.parameters.time).toBe('7am');
    });

    test('should recognize "wake me up at 6:30"', () => {
      const result = classifyIntent('wake me up at 6:30');
      // May classify as set_alarm or set_timer
      expect(['set_alarm', 'set_timer']).toContain(result.intent.name);
    });

    test('should extract time parameters', () => {
      const testCases = [
        { input: 'set alarm for 8:30am', expectedTime: '8:30am' },
        { input: 'alarm at 7pm', expectedTime: '7pm' },
        { input: 'wake me at 6 oclock', expectedTime: '6 oclock' }
      ];

      testCases.forEach(({ input, expectedTime }) => {
        const result = classifyIntent(input);
        if (result.intent.name === 'set_alarm') {
          expect(result.parameters.time).toBe(expectedTime);
        }
      });
    });
  });

  /**
   * Test Suite 6: Play Music Intent
   */
  describe('Intent: play_music', () => {
    test('should recognize "play some music"', () => {
      expectIntent('play some music', 'play_music', 0.75);
    });

    test('should recognize "play jazz"', () => {
      expectIntent('play jazz', 'play_music', 0.75);
    });

    test('should recognize "start my workout playlist"', () => {
      expectIntent('start my workout playlist', 'play_music', 0.6);
    });

    test('should recognize "play songs by the Beatles"', () => {
      expectIntent('play songs by the Beatles', 'play_music', 0.6);
    });
  });

  /**
   * Test Suite 7: Stop Media Intent
   */
  describe('Intent: stop_media', () => {
    test('should recognize "stop"', () => {
      expectIntent('stop', 'stop_media');
    });

    test('should recognize "pause"', () => {
      expectIntent('pause', 'stop_media');
    });

    test('should recognize "stop playing"', () => {
      expectIntent('stop playing', 'stop_media');
    });

    test('should recognize "pause music"', () => {
      expectIntent('pause music', 'stop_media');
    });
  });

  /**
   * Test Suite 8: Volume Control Intent
   */
  describe('Intent: volume_control', () => {
    test('should recognize "turn up the volume"', () => {
      const result = classifyIntent('turn up the volume');
      expect(result.intent.name).toBe('volume_control');
      expect(result.parameters.action).toBe('up');
    });

    test('should recognize "volume down"', () => {
      const result = classifyIntent('volume down');
      expect(result.intent.name).toBe('volume_control');
      expect(result.parameters.action).toBe('down');
    });

    test('should recognize "mute"', () => {
      const result = classifyIntent('mute');
      expect(result.intent.name).toBe('volume_control');
      expect(result.parameters.action).toBe('mute');
    });

    test('should extract volume level', () => {
      const result = classifyIntent('set volume to 50');
      expect(result.intent.name).toBe('volume_control');
      expect(result.parameters.level).toBe(50);
    });
  });

  /**
   * Test Suite 9: Get Time Intent
   */
  describe('Intent: get_time', () => {
    test('should recognize "what time is it"', () => {
      expectIntent('what time is it', 'get_time', 0.8);
    });

    test('should recognize "tell me the time"', () => {
      expectIntent('tell me the time', 'get_time', 0.8);
    });

    test('should recognize "current time"', () => {
      expectIntent('current time', 'get_time', 0.8);
    });
  });

  /**
   * Test Suite 10: Get Date Intent
   */
  describe('Intent: get_date', () => {
    test('should recognize "what\'s today\'s date"', () => {
      expectIntent('what\'s today\'s date', 'get_date', 0.8);
    });

    test('should recognize "what day is it"', () => {
      expectIntent('what day is it', 'get_date', 0.8);
    });

    test('should recognize "current date"', () => {
      expectIntent('current date', 'get_date', 0.8);
    });
  });

  /**
   * Test Suite 11: Search Web Intent
   */
  describe('Intent: search_web', () => {
    test('should recognize "search for pizza recipes"', () => {
      const result = classifyIntent('search for pizza recipes');
      expect(result.intent.name).toBe('search_web');
      expect(result.parameters.query).toBeTruthy();
    });

    test('should recognize "look up the capital of France"', () => {
      expectIntent('look up the capital of France', 'search_web', 0.6);
    });

    test('should recognize "google how to tie a tie"', () => {
      expectIntent('google how to tie a tie', 'search_web', 0.6);
    });
  });

  /**
   * Test Suite 12: Send Message Intent
   */
  describe('Intent: send_message', () => {
    test('should recognize "send a message to John"', () => {
      expectIntent('send a message to John', 'send_message', 0.8);
    });

    test('should recognize "text mom I\'ll be late"', () => {
      expectIntent('text mom I\'ll be late', 'send_message', 0.6);
    });

    test('should recognize "message Sarah happy birthday"', () => {
      expectIntent('message Sarah happy birthday', 'send_message', 0.7);
    });
  });

  /**
   * Test Suite 13: Make Call Intent
   */
  describe('Intent: make_call', () => {
    test('should recognize "call mom"', () => {
      expectIntent('call mom', 'make_call', 0.85);
    });

    test('should recognize "dial John\'s number"', () => {
      expectIntent('dial John\'s number', 'make_call', 0.7);
    });

    test('should recognize "phone the office"', () => {
      expectIntent('phone the office', 'make_call', 0.7);
    });
  });

  /**
   * Test Suite 14: Create Reminder Intent
   */
  describe('Intent: create_reminder', () => {
    test('should recognize "remind me to buy milk"', () => {
      expectIntent('remind me to buy milk', 'create_reminder', 0.75);
    });

    test('should recognize "create a reminder for the meeting"', () => {
      expectIntent('create a reminder for the meeting', 'create_reminder', 0.75);
    });

    test('should recognize "don\'t let me forget to call John"', () => {
      expectIntent('don\'t let me forget to call John', 'create_reminder', 0.6);
    });
  });

  /**
   * Test Suite 15: Add Calendar Event Intent
   */
  describe('Intent: add_calendar_event', () => {
    test('should recognize "add meeting to my calendar"', () => {
      expectIntent('add meeting to my calendar', 'add_calendar_event', 0.8);
    });

    test('should recognize "schedule dentist appointment for Friday"', () => {
      expectIntent('schedule dentist appointment for Friday', 'add_calendar_event', 0.7);
    });
  });

  /**
   * Test Suite 16: Get Directions Intent
   */
  describe('Intent: get_directions', () => {
    test('should recognize "how do I get to the airport"', () => {
      expectIntent('how do I get to the airport', 'get_directions', 0.8);
    });

    test('should recognize "directions to Central Park"', () => {
      expectIntent('directions to Central Park', 'get_directions', 0.8);
    });

    test('should recognize "navigate home"', () => {
      expectIntent('navigate home', 'get_directions', 0.8);
    });
  });

  /**
   * Test Suite 17: Open Application Intent
   */
  describe('Intent: open_application', () => {
    test('should recognize "open Spotify"', () => {
      expectIntent('open Spotify', 'open_application', 0.8);
    });

    test('should recognize "launch Chrome"', () => {
      expectIntent('launch Chrome', 'open_application', 0.8);
    });

    test('should recognize "start Word"', () => {
      expectIntent('start Word', 'open_application', 0.7);
    });
  });

  /**
   * Test Suite 18: Tell Joke Intent
   */
  describe('Intent: tell_joke', () => {
    test('should recognize "tell me a joke"', () => {
      expectIntent('tell me a joke', 'tell_joke', 0.75);
    });

    test('should recognize "make me laugh"', () => {
      expectIntent('make me laugh', 'tell_joke', 0.75);
    });

    test('should recognize "say something funny"', () => {
      expectIntent('say something funny', 'tell_joke', 0.7);
    });
  });

  /**
   * Test Suite 19: Get News Intent
   */
  describe('Intent: get_news', () => {
    test('should recognize "what\'s in the news"', () => {
      expectIntent('what\'s in the news', 'get_news', 0.75);
    });

    test('should recognize "tell me the headlines"', () => {
      expectIntent('tell me the headlines', 'get_news', 0.75);
    });

    test('should recognize "news update"', () => {
      expectIntent('news update', 'get_news', 0.75);
    });
  });

  /**
   * Test Suite 20: Translate Intent
   */
  describe('Intent: translate', () => {
    test('should recognize "translate hello to Spanish"', () => {
      expectIntent('translate hello to Spanish', 'translate', 0.8);
    });

    test('should recognize "how do you say thank you in French"', () => {
      expectIntent('how do you say thank you in French', 'translate', 0.7);
    });
  });

  /**
   * Test Suite 21: Calculate Intent
   */
  describe('Intent: calculate', () => {
    test('should recognize "what\'s 15 times 23"', () => {
      expectIntent('what\'s 15 times 23', 'calculate', 0.8);
    });

    test('should recognize "calculate 100 divided by 4"', () => {
      expectIntent('calculate 100 divided by 4', 'calculate', 0.8);
    });

    test('should recognize "add 45 and 67"', () => {
      expectIntent('add 45 and 67', 'calculate', 0.8);
    });
  });

  /**
   * Test Suite 22: Get Definition Intent
   */
  describe('Intent: get_definition', () => {
    test('should recognize "what does ephemeral mean"', () => {
      expectIntent('what does ephemeral mean', 'get_definition', 0.8);
    });

    test('should recognize "define serendipity"', () => {
      expectIntent('define serendipity', 'get_definition', 0.8);
    });

    test('should recognize "meaning of ubiquitous"', () => {
      expectIntent('meaning of ubiquitous', 'get_definition', 0.8);
    });
  });

  /**
   * Test Suite 23: System Settings Intent
   */
  describe('Intent: system_settings', () => {
    test('should recognize "turn on bluetooth"', () => {
      expectIntent('turn on bluetooth', 'system_settings', 0.8);
    });

    test('should recognize "disable wifi"', () => {
      expectIntent('disable wifi', 'system_settings', 0.8);
    });

    test('should recognize "enable dark mode"', () => {
      expectIntent('enable dark mode', 'system_settings', 0.8);
    });
  });

  /**
   * Test Suite 24: Ask Capability Intent
   */
  describe('Intent: ask_capability', () => {
    test('should recognize "what can you do"', () => {
      expectIntent('what can you do', 'ask_capability');
    });

    test('should recognize "help me"', () => {
      expectIntent('help me', 'ask_capability');
    });

    test('should recognize "what are your capabilities"', () => {
      expectIntent('what are your capabilities', 'ask_capability');
    });
  });

  /**
   * Test Suite 25: Fallback Intent
   */
  describe('Intent: fallback', () => {
    test('should recognize gibberish as fallback', () => {
      const result = classifyIntent('asdfghjkl');
      expect(result.intent.name).toBe('fallback');
    });

    test('should recognize unintelligible input', () => {
      const result = classifyIntent('mumble mumble');
      // Either fallback or very low confidence
      expect(result.confidence < 0.5 || result.intent.name === 'fallback').toBe(true);
    });

    test('should handle empty input', () => {
      const result = classifyIntent('');
      expect(result.intent.name).toBe('fallback');
      expect(result.confidence).toBe(0);
    });
  });

  /**
   * Test Suite 26: Edge Cases
   */
  describe('Edge Cases', () => {
    test('should handle very long input', () => {
      const longInput = 'set a timer for ' + 'very '.repeat(100) + 'long time';
      const result = classifyIntent(longInput);
      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
    });

    test('should handle special characters', () => {
      const result = classifyIntent('what\'s the weather!?!?');
      expect(result.intent.name).toBe('get_weather');
    });

    test('should handle mixed case', () => {
      const result = classifyIntent('WHAT TIME IS IT');
      expect(result.intent.name).toBe('get_time');
    });

    test('should handle extra whitespace', () => {
      const result = classifyIntent('  what    time   is    it  ');
      expect(result.intent.name).toBe('get_time');
    });

    test('should handle numbers in text', () => {
      const result = classifyIntent('set timer for 10 minutes');
      expect(result.intent.name).toBe('set_timer');
    });
  });

  /**
   * Test Suite 27: Confidence Thresholds
   */
  describe('Confidence Thresholds', () => {
    test('high-risk intents should require higher confidence', () => {
      const intents = getAllIntents();

      const highRiskIntents = intents.filter(i =>
        ['make_call', 'send_message'].includes(i.name)
      );

      highRiskIntents.forEach(intent => {
        expect(intent.confidence_threshold).toBeGreaterThanOrEqual(0.8);
      });
    });

    test('low-risk intents can have lower confidence', () => {
      const intents = getAllIntents();

      const lowRiskIntents = intents.filter(i =>
        ['get_weather', 'get_time', 'tell_joke'].includes(i.name)
      );

      lowRiskIntents.forEach(intent => {
        expect(intent.confidence_threshold).toBeLessThanOrEqual(0.75);
      });
    });
  });

  /**
   * Test Suite 28: Batch Classification
   */
  describe('Batch Classification', () => {
    test('should handle multiple inputs', () => {
      const { batchClassify } = require('../services/nluService');

      const inputs = [
        'hello',
        'what time is it',
        'set a timer for 5 minutes'
      ];

      const results = batchClassify(inputs);

      expect(results).toHaveLength(3);
      expect(results[0].intent.name).toBe('greeting');
      expect(results[1].intent.name).toBe('get_time');
      expect(results[2].intent.name).toBe('set_timer');
    });
  });
});
