import * as adminService from '../services/admin.service.js';
import * as attemptService from '../services/attempt.service.js';
import * as sessionService from '../services/session.service.js';

export const internalController = {
  async getSession(req, res) {
    const { sessionId } = req.params;
    const session = await sessionService.getSessionForInternalUse(sessionId);
    res.json({ data: session });
  },

  async validateAnswer(req, res) {
    const { challenge, answer } = req.body;
    const validation = await attemptService.validateAnswer(challenge, answer);
    res.json({ data: validation });
  },

  async deleteUserData(req, res) {
    const { userId } = req.params;
    await sessionService.deleteUserData(userId);
    res.status(204).end();
  },

  async getLevelStats(req, res) {
    const { from, to } = req.validated.query;
    const levelStats = await adminService.getLevelStats({ from, to });
    res.json({ data: levelStats });
  },
};
