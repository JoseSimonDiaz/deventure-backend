import * as progressService from '../services/progress.service.js';

export const internalController = {
  async getLevelUnlocked(req, res) {
    const { userId, levelId } = req.params;
    const levelUnlocked = await progressService.isLevelUnlocked(userId, levelId, req.correlationId);
    res.json({ data: levelUnlocked });
  },

  async getPlayerAchievements(req, res) {
    const { userId } = req.params;
    const playerAchievements = await progressService.getPlayerAchievements(
      userId,
      req.correlationId,
    );
    res.json({ data: playerAchievements });
  },

  async registerLevelCompletion(req, res) {
    const completionResult = await progressService.registerLevelCompletion(
      req.body,
      req.correlationId,
    );
    res.json({ data: completionResult });
  },

  async deletePlayerData(req, res) {
    const { userId } = req.params;
    await progressService.deletePlayerData(userId);
    res.status(204).end();
  },

  async getCompletionStats(req, res) {
    const { from, to } = req.validated.query;
    const completionStats = await progressService.getCompletionStats({ from, to });
    res.json({ data: completionStats });
  },
};
