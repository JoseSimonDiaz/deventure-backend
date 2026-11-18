import * as attemptService from '../services/attempt.service.js';
import * as hintService from '../services/hint.service.js';
import * as sessionService from '../services/session.service.js';

export const gameplayController = {
  async startSession(req, res) {
    const { levelId } = req.body;
    const session = await sessionService.startSession({
      userId: req.user.id,
      levelId,
      correlationId: req.correlationId,
    });
    res.status(201).json({ data: session });
  },

  async getSession(req, res) {
    const { sessionId } = req.params;
    const session = await sessionService.getSession({
      userId: req.user.id,
      sessionId,
      correlationId: req.correlationId,
    });
    res.json({ data: session });
  },

  async abandonSession(req, res) {
    const { sessionId } = req.params;
    const session = await sessionService.abandonSession({
      userId: req.user.id,
      sessionId,
      correlationId: req.correlationId,
    });
    res.json({ data: session });
  },

  async submitAttempt(req, res) {
    const { sessionId } = req.params;
    const { challengeId, answer } = req.body;
    const attemptResult = await attemptService.submitAttempt({
      userId: req.user.id,
      sessionId,
      challengeId,
      answer,
      correlationId: req.correlationId,
    });
    res.json({ data: attemptResult });
  },

  async requestHint(req, res) {
    const { sessionId } = req.params;
    const { challengeId } = req.body;
    const hint = await hintService.requestHint({
      userId: req.user.id,
      sessionId,
      challengeId,
      correlationId: req.correlationId,
    });
    res.json({ data: hint });
  },
};
