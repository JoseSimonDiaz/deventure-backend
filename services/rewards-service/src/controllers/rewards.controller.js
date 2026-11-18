import * as rewardsService from '../services/rewards.service.js';

export const rewardsController = {
  async getMyGallery(req, res) {
    const { type, status } = req.validated.query;
    const gallery = await rewardsService.getPlayerGallery({
      userId: req.user.id,
      type,
      status,
      correlationId: req.correlationId,
    });
    res.json({ data: gallery });
  },

  async markSeen(req, res) {
    const { rewardId } = req.params;
    await rewardsService.markRewardSeen(req.user.id, rewardId);
    res.status(204).end();
  },
};
