import * as accountService from '../services/account.service.js';

export const accountController = {
  async getSettings(req, res) {
    const settings = await accountService.getSettings(req.user.id);
    res.json({ data: settings });
  },

  async updateSettings(req, res) {
    const settings = await accountService.updateSettings(req.user.id, req.body);
    res.json({ data: settings });
  },

  async updateUsername(req, res) {
    const { username } = req.body;
    const session = await accountService.updateUsername(req.user.id, username);
    res.json({ data: session });
  },

  async changePassword(req, res) {
    const session = await accountService.changePassword(req.user.id, req.body);
    res.json({ data: session });
  },

  async updateAvatar(req, res) {
    const user = await accountService.updateAvatar(req.user.id, req.body, req.correlationId);
    res.json({ data: user });
  },

  async deleteAccount(req, res) {
    await accountService.deleteAccount(req.user.id, req.body, req.correlationId);
    res.status(204).end();
  },
};
