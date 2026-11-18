import * as progressService from '../services/progress.service.js';

export const progressController = {
  async getMyProgress(req, res) {
    const playerProgress = await progressService.getMyProgress(req.user.id, req.correlationId);
    res.json({ data: playerProgress });
  },

  async getMySummary(req, res) {
    const playerSummary = await progressService.getMySummary(req.user.id, req.correlationId);
    res.json({ data: playerSummary });
  },

  async getSeenTheory(req, res) {
    const seenTheory = await progressService.getSeenTheory(req.user.id);
    res.json({ data: seenTheory });
  },

  async markTheorySeen(req, res) {
    const { zoneId } = req.body;
    await progressService.markTheorySeen(req.user.id, zoneId);
    res.status(204).end();
  },
};
