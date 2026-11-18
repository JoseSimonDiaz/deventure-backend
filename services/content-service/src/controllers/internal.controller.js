import * as contentService from '../services/content.service.js';

export const internalController = {
  async getLevelSummary(req, res) {
    const { levelId } = req.params;
    const levelSummary = await contentService.getLevelSummary(levelId);
    res.json({ data: levelSummary });
  },

  async getChallenge(req, res) {
    const { challengeId } = req.params;
    const challenge = await contentService.getChallengeWithSolution(challengeId);
    res.json({ data: challenge });
  },

  async getZonesStructure(_req, res) {
    const zonesStructure = await contentService.getZonesStructure();
    res.json({ data: zonesStructure });
  },

  async getHint(req, res) {
    const { challengeId, hintOrder } = req.params;
    const hint = await contentService.getHint(challengeId, hintOrder);
    res.json({ data: hint });
  },
};
