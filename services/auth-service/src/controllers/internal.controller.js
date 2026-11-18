import * as accountService from '../services/account.service.js';

export const internalController = {
  async getUserStats(req, res) {
    const { from, to } = req.validated.query;
    const userStats = await accountService.getUserStats({ from, to });
    res.json({ data: userStats });
  },

  async getSessionVersion(req, res) {
    const { userId } = req.params;
    const userSession = await accountService.getSessionVersion(userId);
    res.json({ data: userSession });
  },
};
