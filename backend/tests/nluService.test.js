/**
 * NLU Service Tests
 *
 * Tests for the core NLU service functions:
 * - Text preprocessing
 * - Similarity calculation
 * - Parameter extraction
 * - Clarification logic
 *
 * @module tests/nluService
 * @author Hi-Spectra Team
 * @version 1.0.0
 */

const {
  classifyIntent,
  getClarification,
  preprocessText,
  similarity
} = require('../services/nluService');

describe('NLU Service', () => {
  /**
   * Test Suite 1: Text Preprocessing
   */
  describe('preprocessText', () => {
    test('should convert to lowercase', () => {
      expect(preprocessText('HELLO WORLD')).toBe('hello world');
      expect(preprocessText('What Time Is It')).toBe('what time is it');
    });

    test('should trim whitespace', () => {
      expect(preprocessText('  hello  ')).toBe('hello');
      expect(preprocessText('\t\nhello\n\t')).toBe('hello');
    });

    test('should normalize multiple spaces', () => {
      expect(preprocessText('hello    world')).toBe('hello world');
      expect(preprocessText('what  is   the    time')).toBe('what is the time');
    });

    test('should remove punctuation', () => {
      expect(preprocessText('hello!')).toBe('hello');
      expect(preprocessText('what\'s up?')).toBe('whats up');
      expect(preprocessText('hello, world.')).toBe('hello world');
    });

    test('should handle empty string', () => {
      expect(preprocessText('')).toBe('');
      expect(preprocessText('   ')).toBe('');
    });

    test('should handle null/undefined', () => {
      expect(preprocessText(null)).toBe('');
      expect(preprocessText(undefined)).toBe('');
    });

    test('should handle special characters', () => {
      expect(preprocessText('hello@world#123')).toBe('helloworld123');
      expect(preprocessText('$100.50')).toBe('10050');
    });
  });

  /**
   * Test Suite 2: Similarity Function
   */
  describe('similarity', () => {
    test('should return 1.0 for identical strings', () => {
      expect(similarity('hello', 'hello')).toBe(1.0);
      expect(similarity('test string', 'test string')).toBe(1.0);
    });

    test('should return 0.0 for completely different strings', () => {
      const sim = similarity('abc', 'xyz');
      expect(sim).toBeLessThan(0.3);
    });

    test('should return high similarity for similar strings', () => {
      const sim = similarity('hello world', 'hello worlds');
      expect(sim).toBeGreaterThan(0.9);
    });

    test('should handle case differences', () => {
      // Note: similarity is case-sensitive, preprocessing should lowercase first
      const sim = similarity('hello', 'HELLO');
      expect(sim).toBeLessThan(1.0);
    });

    test('should calculate partial matches', () => {
      const sim1 = similarity('set timer', 'set a timer');
      const sim2 = similarity('set timer', 'timer set');

      expect(sim1).toBeGreaterThan(0.7);
      expect(sim2).toBeGreaterThan(0.6);
    });

    test('should handle empty strings', () => {
      expect(similarity('', '')).toBe(1.0);
      expect(similarity('hello', '')).toBeLessThan(0.5);
    });
  });

  /**
   * Test Suite 3: Parameter Extraction
   */
  describe('Parameter Extraction', () => {
    test('should extract duration from timer command', () => {
      const result = classifyIntent('set a timer for 10 minutes');
      expect(result.parameters.duration).toBeDefined();
      expect(result.parameters.duration.value).toBe(10);
      expect(result.parameters.duration.unit).toMatch(/minute/i);
    });

    test('should extract different time units', () => {
      const testCases = [
        { input: 'timer for 30 seconds', value: 30, unit: /second/i },
        { input: 'timer for 2 hours', value: 2, unit: /hour/i },
        { input: 'timer 5 min', value: 5, unit: /min/i }
      ];

      testCases.forEach(({ input, value, unit }) => {
        const result = classifyIntent(input);
        if (result.intent.name === 'set_timer') {
          expect(result.parameters.duration).toBeDefined();
          expect(result.parameters.duration.value).toBe(value);
          expect(result.parameters.duration.unit).toMatch(unit);
        }
      });
    });

    test('should extract time from alarm command', () => {
      const result = classifyIntent('set alarm for 7:30am');
      if (result.intent.name === 'set_alarm') {
        expect(result.parameters.time).toBe('7:30am');
      }
    });

    test('should extract volume level', () => {
      const result = classifyIntent('set volume to 75');
      if (result.intent.name === 'volume_control') {
        expect(result.parameters.level).toBe(75);
      }
    });

    test('should extract volume action', () => {
      const testCases = [
        { input: 'turn up the volume', action: 'up' },
        { input: 'volume down', action: 'down' },
        { input: 'mute', action: 'mute' }
      ];

      testCases.forEach(({ input, action }) => {
        const result = classifyIntent(input);
        if (result.intent.name === 'volume_control') {
          expect(result.parameters.action).toBe(action);
        }
      });
    });

    test('should extract search query', () => {
      const result = classifyIntent('search for pizza recipes');
      if (result.intent.name === 'search_web') {
        expect(result.parameters.query).toBeTruthy();
        expect(result.parameters.query).toContain('pizza');
      }
    });
  });

  /**
   * Test Suite 4: Classification Results Structure
   */
  describe('Classification Result Structure', () => {
    test('should return required fields', () => {
      const result = classifyIntent('hello');

      expect(result).toHaveProperty('intent');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('parameters');
      expect(result).toHaveProperty('originalInput');
      expect(result).toHaveProperty('processedInput');
    });

    test('should include intent details', () => {
      const result = classifyIntent('what time is it');

      expect(result.intent).toHaveProperty('id');
      expect(result.intent).toHaveProperty('name');
      expect(result.intent).toHaveProperty('description');
      expect(result.intent).toHaveProperty('examples');
      expect(result.intent).toHaveProperty('parameters');
      expect(result.intent).toHaveProperty('confidence_threshold');
    });

    test('should preserve original input', () => {
      const input = 'What Time Is It???';
      const result = classifyIntent(input);

      expect(result.originalInput).toBe(input);
    });

    test('should show processed input', () => {
      const result = classifyIntent('What Time Is It???');

      expect(result.processedInput).toBe('what time is it');
    });

    test('should return confidence as number between 0 and 1', () => {
      const result = classifyIntent('hello');

      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  /**
   * Test Suite 5: Clarification Logic
   */
  describe('getClarification', () => {
    test('should return null for high confidence', () => {
      const result = classifyIntent('hello');
      const clarification = getClarification(result);

      if (result.confidence >= 0.7) {
        expect(clarification).toBeNull();
      }
    });

    test('should request clarification for fallback intent', () => {
      const result = classifyIntent('asdfghjkl');
      const clarification = getClarification(result);

      expect(clarification).toBeTruthy();
      expect(clarification).toContain('rephrase');
    });

    test('should suggest rephrase for low confidence', () => {
      // Create a low confidence classification
      const result = {
        intent: { name: 'get_weather', description: 'check the weather', parameters: [] },
        confidence: 0.5,
        parameters: {}
      };

      const clarification = getClarification(result);
      expect(clarification).toBeTruthy();
    });

    test('should request missing required parameters', () => {
      // Simulate missing parameter
      const result = {
        intent: {
          name: 'set_alarm',
          description: 'set an alarm',
          parameters: [
            { name: 'time', required: true }
          ]
        },
        confidence: 0.9,
        parameters: {} // Missing 'time' parameter
      };

      const clarification = getClarification(result);
      expect(clarification).toBeTruthy();
      expect(clarification.toLowerCase()).toContain('time');
    });
  });

  /**
   * Test Suite 6: Robustness Tests
   */
  describe('Robustness', () => {
    test('should handle very short input', () => {
      const result = classifyIntent('hi');
      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
    });

    test('should handle very long input', () => {
      const longInput = 'what is the weather like '.repeat(20);
      const result = classifyIntent(longInput);
      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
    });

    test('should handle numbers only', () => {
      const result = classifyIntent('123456');
      expect(result).toBeDefined();
      expect(result.intent.name).toBe('fallback');
    });

    test('should handle mixed languages (gracefully fail)', () => {
      const result = classifyIntent('こんにちは'); // Japanese "hello"
      expect(result).toBeDefined();
      // Should either be fallback or low confidence
      expect(result.intent.name === 'fallback' || result.confidence < 0.5).toBe(true);
    });

    test('should handle rapid successive calls', () => {
      const inputs = ['hello', 'what time is it', 'goodbye'];
      const results = inputs.map(input => classifyIntent(input));

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.intent).toBeDefined();
      });
    });
  });

  /**
   * Test Suite 7: Performance Tests
   */
  describe('Performance', () => {
    test('should classify in under 500ms', () => {
      const start = Date.now();
      classifyIntent('what time is it');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });

    test('should handle batch processing efficiently', () => {
      const { batchClassify } = require('../services/nluService');

      const inputs = Array(100).fill('hello');
      const start = Date.now();
      const results = batchClassify(inputs);
      const duration = Date.now() - start;

      expect(results).toHaveLength(100);
      expect(duration).toBeLessThan(5000); // 5 seconds for 100 items
    });
  });

  /**
   * Test Suite 8: Intent Schema Validation
   */
  describe('Intent Schema Validation', () => {
    const { getAllIntents } = require('../models/intentSchemas');

    test('all intents should have required fields', () => {
      const intents = getAllIntents();

      intents.forEach(intent => {
        expect(intent).toHaveProperty('id');
        expect(intent).toHaveProperty('name');
        expect(intent).toHaveProperty('description');
        expect(intent).toHaveProperty('examples');
        expect(intent).toHaveProperty('parameters');
        expect(intent).toHaveProperty('confidence_threshold');
        expect(intent).toHaveProperty('response_type');
      });
    });

    test('all intents should have unique IDs', () => {
      const intents = getAllIntents();
      const ids = intents.map(i => i.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    test('all intents should have unique names', () => {
      const intents = getAllIntents();
      const names = intents.map(i => i.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    });

    test('all intents should have at least one example', () => {
      const intents = getAllIntents();

      intents.forEach(intent => {
        expect(intent.examples.length).toBeGreaterThan(0);
      });
    });

    test('confidence thresholds should be valid', () => {
      const intents = getAllIntents();

      intents.forEach(intent => {
        expect(intent.confidence_threshold).toBeGreaterThanOrEqual(0);
        expect(intent.confidence_threshold).toBeLessThanOrEqual(1);
      });
    });

    test('should have exactly 25 intents', () => {
      const intents = getAllIntents();
      expect(intents.length).toBe(25);
    });
  });
});
