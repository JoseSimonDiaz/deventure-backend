import * as rewardsService from '../services/rewards.service.js';

export const internalController = {
  async evaluateRewards(req, res) {
    const evaluation = await rewardsService.evaluateRewards(req.body, req.correlationId);
    res.json({ data: evaluation });
  },

  async getOwnedReward(req, res) {
    const { userId, rewardId } = req.params;
    const ownedReward = await rewardsService.getOwnedReward(userId, rewardId);
    res.json({ data: ownedReward });
  },

  async deletePlayerData(req, res) {
    const { userId } = req.params;
    await rewardsService.deletePlayerData(userId);
    res.status(204).end();
  },
};
