/**
 * Intent Routes
 *
 * API endpoints for intent classification and NLU operations
 *
 * Routes:
 * - POST /api/intents/classify - Classify a single user input
 * - POST /api/intents/batch - Batch classify multiple inputs
 * - GET /api/intents - Get all available intents
 * - GET /api/intents/:id - Get specific intent by ID
 *
 * @module routes/intents
 * @author Hi-Spectra Team
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const { classifyIntent, batchClassify, getClarification } = require('../services/nluService');
const { getAllIntents, getIntentById } = require('../models/intentSchemas');

/**
 * POST /api/intents/classify
 * Classify a single user input and return the intent with confidence score
 *
 * Request body:
 * {
 *   "text": "what's the weather like today"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "classification": {
 *     "intent": {...},
 *     "confidence": 0.85,
 *     "parameters": {...},
 *     "originalInput": "what's the weather like today",
 *     "processedInput": "whats the weather like today"
 *   },
 *   "clarification": null
 * }
 */
router.post('/classify', (req, res) => {
  try {
    const { text } = req.body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input: text field is required and must be a string'
      });
    }

    // Classify the intent
    const classification = classifyIntent(text);

    // Get clarification if needed
    const clarification = getClarification(classification);

    // Return the result
    res.json({
      success: true,
      classification: classification,
      clarification: clarification,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in classify route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during classification',
      message: error.message
    });
  }
});

/**
 * POST /api/intents/batch
 * Classify multiple user inputs in a single request
 *
 * Request body:
 * {
 *   "inputs": ["hello", "what's the weather", "set a timer for 10 minutes"]
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "results": [...],
 *   "count": 3
 * }
 */
router.post('/batch', (req, res) => {
  try {
    const { inputs } = req.body;

    // Validate input
    if (!Array.isArray(inputs)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input: inputs field must be an array of strings'
      });
    }

    // Validate array length (prevent abuse)
    if (inputs.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Too many inputs: maximum 100 inputs per batch request'
      });
    }

    // Batch classify
    const results = batchClassify(inputs);

    res.json({
      success: true,
      results: results,
      count: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in batch classify route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during batch classification',
      message: error.message
    });
  }
});

/**
 * GET /api/intents
 * Get all available intent schemas
 *
 * Query parameters:
 * - includeExamples: boolean (default: false) - Include example utterances
 *
 * Response:
 * {
 *   "success": true,
 *   "intents": [...],
 *   "count": 25
 * }
 */
router.get('/', (req, res) => {
  try {
    const includeExamples = req.query.includeExamples === 'true';

    let intents = getAllIntents();

    // Optionally filter out examples to reduce response size
    if (!includeExamples) {
      intents = intents.map(intent => {
        const { examples, ...intentWithoutExamples } = intent;
        return {
          ...intentWithoutExamples,
          exampleCount: examples.length
        };
      });
    }

    res.json({
      success: true,
      intents: intents,
      count: intents.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in get intents route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/intents/:id
 * Get a specific intent by ID
 *
 * Parameters:
 * - id: Intent ID (e.g., "intent_001")
 *
 * Response:
 * {
 *   "success": true,
 *   "intent": {...}
 * }
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const intent = getIntentById(id);

    if (!intent) {
      return res.status(404).json({
        success: false,
        error: `Intent not found: ${id}`
      });
    }

    res.json({
      success: true,
      intent: intent,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in get intent by id route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
