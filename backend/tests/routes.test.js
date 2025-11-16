/**
 * API Routes Tests
 *
 * Tests for Express API endpoints
 *
 * @module tests/routes
 * @author Hi-Spectra Team
 * @version 1.0.0
 */

const request = require('supertest');
const app = require('../index');

describe('API Routes', () => {
  /**
   * Test Suite 1: Health Check
   */
  describe('GET /health', () => {
    test('should return 200 OK', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
    });

    test('should include service info', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  /**
   * Test Suite 2: Root Endpoint
   */
  describe('GET /', () => {
    test('should return API information', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  /**
   * Test Suite 3: Intent Classification Endpoint
   */
  describe('POST /api/intents/classify', () => {
    test('should classify valid input', async () => {
      const response = await request(app)
        .post('/api/intents/classify')
        .send({ text: 'what time is it' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.classification).toBeDefined();
      expect(response.body.classification.intent.name).toBe('get_time');
    });

    test('should return 400 for missing text field', async () => {
      const response = await request(app)
        .post('/api/intents/classify')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('text field is required');
    });

    test('should return 400 for non-string text', async () => {
      const response = await request(app)
        .post('/api/intents/classify')
        .send({ text: 123 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should include clarification when needed', async () => {
      const response = await request(app)
        .post('/api/intents/classify')
        .send({ text: 'asdfghjkl' });

      expect(response.status).toBe(200);
      expect(response.body.clarification).toBeTruthy();
    });

    test('should handle multiple requests', async () => {
      const requests = [
        'hello',
        'what time is it',
        'set a timer for 5 minutes'
      ].map(text =>
        request(app)
          .post('/api/intents/classify')
          .send({ text })
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  /**
   * Test Suite 4: Batch Classification Endpoint
   */
  describe('POST /api/intents/batch', () => {
    test('should classify multiple inputs', async () => {
      const response = await request(app)
        .post('/api/intents/batch')
        .send({
          inputs: ['hello', 'what time is it', 'goodbye']
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.results).toHaveLength(3);
      expect(response.body.count).toBe(3);
    });

    test('should return 400 for non-array inputs', async () => {
      const response = await request(app)
        .post('/api/intents/batch')
        .send({ inputs: 'not an array' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 for too many inputs', async () => {
      const response = await request(app)
        .post('/api/intents/batch')
        .send({ inputs: Array(101).fill('hello') });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('maximum 100');
    });

    test('should handle empty array', async () => {
      const response = await request(app)
        .post('/api/intents/batch')
        .send({ inputs: [] });

      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(0);
    });
  });

  /**
   * Test Suite 5: Get All Intents Endpoint
   */
  describe('GET /api/intents', () => {
    test('should return all intents', async () => {
      const response = await request(app).get('/api/intents');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.intents).toBeDefined();
      expect(response.body.count).toBe(25);
    });

    test('should exclude examples by default', async () => {
      const response = await request(app).get('/api/intents');

      const firstIntent = response.body.intents[0];
      expect(firstIntent).not.toHaveProperty('examples');
      expect(firstIntent).toHaveProperty('exampleCount');
    });

    test('should include examples when requested', async () => {
      const response = await request(app)
        .get('/api/intents')
        .query({ includeExamples: 'true' });

      const firstIntent = response.body.intents[0];
      expect(firstIntent).toHaveProperty('examples');
      expect(Array.isArray(firstIntent.examples)).toBe(true);
    });
  });

  /**
   * Test Suite 6: Get Intent by ID Endpoint
   */
  describe('GET /api/intents/:id', () => {
    test('should return specific intent', async () => {
      const response = await request(app).get('/api/intents/intent_001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.intent).toBeDefined();
      expect(response.body.intent.id).toBe('intent_001');
    });

    test('should return 404 for non-existent intent', async () => {
      const response = await request(app).get('/api/intents/intent_999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  /**
   * Test Suite 7: 404 Handling
   */
  describe('404 Not Found', () => {
    test('should return 404 for non-existent route', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Not Found');
    });
  });

  /**
   * Test Suite 8: CORS Headers
   */
  describe('CORS', () => {
    test('should include CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
