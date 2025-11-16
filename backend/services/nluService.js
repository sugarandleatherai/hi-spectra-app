/**
 * Natural Language Understanding Service
 *
 * This service handles intent classification and entity extraction from user input.
 * It processes raw text (from speech recognition or typed input) and returns:
 * - The classified intent
 * - Confidence score
 * - Extracted parameters/entities
 *
 * Current Implementation: Rule-based matching with fuzzy string similarity
 * Future Enhancement: Replace with ML model (BERT, GPT, or custom trained model)
 *
 * @module nluService
 * @author Hi-Spectra Team
 * @version 1.0.0
 */

const { getAllIntents, getIntentById, validateConfidence } = require('../models/intentSchemas');

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching of user input to intent examples
 *
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} The edit distance between the strings
 * @private
 */
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  // Initialize first column and row
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  // Fill in the rest of the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1)
 *
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score from 0 (completely different) to 1 (identical)
 * @private
 */
function similarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Preprocess user input text
 * - Convert to lowercase
 * - Trim whitespace
 * - Remove extra spaces
 * - Remove punctuation (except apostrophes in contractions)
 *
 * @param {string} text - Raw user input
 * @returns {string} Cleaned text
 * @private
 */
function preprocessText(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')                    // Replace multiple spaces with single space
    .replace(/[^\w\s']/g, '')                // Remove punctuation except apostrophes
    .replace(/\s+'/g, ' ')                   // Clean up leading apostrophes
    .replace(/'\s+/g, ' ');                  // Clean up trailing apostrophes
}

/**
 * Extract time duration from text (for timer/reminder intents)
 * Recognizes patterns like "10 minutes", "2 hours", "30 seconds"
 *
 * @param {string} text - Input text
 * @returns {Object|null} Extracted duration {value: number, unit: string} or null
 * @private
 */
function extractDuration(text) {
  const patterns = [
    /(\d+)\s*(second|seconds|sec|secs|s)/i,
    /(\d+)\s*(minute|minutes|min|mins|m)/i,
    /(\d+)\s*(hour|hours|hr|hrs|h)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        value: parseInt(match[1]),
        unit: match[2].toLowerCase()
      };
    }
  }

  return null;
}

/**
 * Extract time from text (for alarm intents)
 * Recognizes patterns like "7am", "6:30", "8 o'clock"
 *
 * @param {string} text - Input text
 * @returns {string|null} Extracted time or null
 * @private
 */
function extractTime(text) {
  const patterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)?/i,         // 7:30, 7:30pm
    /(\d{1,2})\s*(am|pm)/i,                   // 7am, 7pm
    /(\d{1,2})\s*o'?clock/i                   // 7 oclock, 7 o'clock
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return null;
}

/**
 * Extract parameters based on intent type
 * This is a simplified implementation. In production, use NER (Named Entity Recognition)
 *
 * @param {string} text - Preprocessed user input
 * @param {Object} intent - The classified intent schema
 * @returns {Object} Extracted parameters
 * @private
 */
function extractParameters(text, intent) {
  const params = {};

  // Intent-specific parameter extraction
  switch (intent.name) {
    case 'set_timer':
      const duration = extractDuration(text);
      if (duration) params.duration = duration;
      break;

    case 'set_alarm':
      const time = extractTime(text);
      if (time) params.time = time;
      break;

    case 'volume_control':
      if (text.includes('up') || text.includes('louder') || text.includes('increase')) {
        params.action = 'up';
      } else if (text.includes('down') || text.includes('quieter') || text.includes('decrease')) {
        params.action = 'down';
      } else if (text.includes('mute')) {
        params.action = 'mute';
      }

      // Extract volume level if specified (e.g., "set volume to 50")
      const volumeMatch = text.match(/(\d+)\s*(?:percent|%)?/);
      if (volumeMatch) {
        params.level = parseInt(volumeMatch[1]);
      }
      break;

    case 'search_web':
    case 'get_definition':
    case 'calculate':
      // Extract everything after the command word as the query/word/expression
      const commandWords = ['search', 'look up', 'google', 'find', 'define', 'meaning', 'calculate', 'what'];
      let query = text;

      for (const word of commandWords) {
        if (text.includes(word)) {
          const parts = text.split(word);
          if (parts.length > 1) {
            query = parts[parts.length - 1].trim();
            break;
          }
        }
      }

      if (intent.name === 'search_web') params.query = query;
      else if (intent.name === 'get_definition') params.word = query;
      else if (intent.name === 'calculate') params.expression = query;
      break;
  }

  return params;
}

/**
 * Classify user intent from input text
 * Main classification algorithm:
 * 1. Preprocess input text
 * 2. Compare against all intent examples using fuzzy matching
 * 3. Calculate confidence scores
 * 4. Return best matching intent above confidence threshold
 *
 * @param {string} userInput - Raw user input text
 * @returns {Object} Classification result with intent, confidence, and parameters
 */
function classifyIntent(userInput) {
  // Preprocess the input
  const cleanedInput = preprocessText(userInput);

  if (!cleanedInput) {
    return {
      intent: getIntentById('intent_025'), // fallback
      confidence: 0.0,
      parameters: {},
      originalInput: userInput,
      processedInput: cleanedInput
    };
  }

  const intents = getAllIntents();
  let bestMatch = {
    intent: null,
    confidence: 0.0
  };

  // Score each intent based on similarity to examples
  for (const intent of intents) {
    // Skip fallback intent in primary matching
    if (intent.name === 'fallback') continue;

    let maxSimilarity = 0;

    // Check similarity against each example utterance
    for (const example of intent.examples) {
      const exampleCleaned = preprocessText(example);
      const sim = similarity(cleanedInput, exampleCleaned);

      // Also check if cleaned input contains key words from example
      const words = exampleCleaned.split(' ');
      const containsKeyWords = words.some(word =>
        word.length > 3 && cleanedInput.includes(word)
      );

      // Boost score if key words are present
      const boostedSim = containsKeyWords ? Math.min(sim + 0.1, 1.0) : sim;

      if (boostedSim > maxSimilarity) {
        maxSimilarity = boostedSim;
      }
    }

    // Update best match if this intent scores higher
    if (maxSimilarity > bestMatch.confidence) {
      bestMatch = {
        intent: intent,
        confidence: maxSimilarity
      };
    }
  }

  // If no intent meets threshold, use fallback
  if (!bestMatch.intent || !validateConfidence(bestMatch.intent.id, bestMatch.confidence)) {
    bestMatch.intent = getIntentById('intent_025'); // fallback
    bestMatch.confidence = 1.0; // Fallback is always confident
  }

  // Extract parameters for the classified intent
  const parameters = extractParameters(cleanedInput, bestMatch.intent);

  return {
    intent: bestMatch.intent,
    confidence: parseFloat(bestMatch.confidence.toFixed(3)),
    parameters: parameters,
    originalInput: userInput,
    processedInput: cleanedInput
  };
}

/**
 * Batch classify multiple inputs
 * Useful for testing and batch processing
 *
 * @param {Array<string>} inputs - Array of user input strings
 * @returns {Array<Object>} Array of classification results
 */
function batchClassify(inputs) {
  return inputs.map(input => classifyIntent(input));
}

/**
 * Get suggested clarification when intent confidence is low
 *
 * @param {Object} classification - Classification result from classifyIntent
 * @returns {string} Suggested clarification question
 */
function getClarification(classification) {
  if (classification.intent.name === 'fallback') {
    return "I didn't quite catch that. Could you rephrase what you'd like me to do?";
  }

  if (classification.confidence < 0.6) {
    return `Did you mean to ${classification.intent.description}? Please clarify.`;
  }

  // Check for missing required parameters
  const missingParams = classification.intent.parameters
    .filter(param => param.required && !classification.parameters[param.name]);

  if (missingParams.length > 0) {
    const paramName = missingParams[0].name;
    return `I understand you want to ${classification.intent.description}, but I need to know the ${paramName}. Can you provide that?`;
  }

  return null;
}

module.exports = {
  classifyIntent,
  batchClassify,
  getClarification,
  preprocessText,
  similarity
};
